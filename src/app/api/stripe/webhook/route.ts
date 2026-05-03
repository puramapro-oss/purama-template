/**
 * POST /api/stripe/webhook
 *   Signature Stripe vérifiée via STRIPE_WEBHOOK_SECRET. Idempotent (table
 *   stripe_events). Met à jour subscriptions + profiles + crée commission
 *   parrainage si applicable.
 *
 * En mock-mode (MOCK_STRIPE_CONNECT=true) : accepte JSON brut sans signature.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { getStripe, isStripeMocked, PLANS, type PlanCode } from "@/lib/stripe";
import { splitRevenue } from "@/lib/karma";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

interface SubscriptionEvent {
  id: string;
  customer: string;
  status: Stripe.Subscription.Status;
  current_period_start: number;
  current_period_end: number;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  metadata: { userId?: string; plan?: string; referralCode?: string };
  items: { data: Array<{ price: { id: string } }> };
}

interface MockEvent {
  id: string;
  type: string;
  data: { object: SubscriptionEvent | Record<string, unknown> };
}

export async function POST(req: NextRequest) {
  const service = getSupabaseServiceClient();
  let event: { id: string; type: string; data: { object: unknown } };

  if (isStripeMocked()) {
    const json = await req.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }
    const mock = json as MockEvent;
    if (!mock.id || !mock.type) {
      return NextResponse.json({ error: "Event id/type requis." }, { status: 400 });
    }
    event = mock;
  } else {
    const sig = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !secret) {
      return NextResponse.json(
        { error: "Signature ou secret webhook manquant." },
        { status: 400 }
      );
    }
    const raw = await req.text();
    try {
      event = getStripe().webhooks.constructEvent(raw, sig, secret);
    } catch (err) {
      return NextResponse.json(
        {
          error: "Signature invalide.",
          debug: err instanceof Error ? err.message : "unknown",
        },
        { status: 400 }
      );
    }
  }

  // Idempotence : skip si event_id déjà traité
  const { data: existing } = await service
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  let outcome: { ok: boolean; status: string } = { ok: true, status: "processed" };

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.trial_will_end":
        await handleSubscriptionEvent(service, event.data.object as SubscriptionEvent);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(service, event.data.object as SubscriptionEvent);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePayment(
          service,
          event.data.object as Stripe.Invoice
        );
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(service, event.data.object as Stripe.Invoice);
        break;
      default:
        outcome = { ok: true, status: "skipped" };
    }
  } catch (error) {
    outcome = {
      ok: false,
      status: error instanceof Error ? error.message : "failed",
    };
  }

  await service.from("stripe_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    status: outcome.ok ? "processed" : "failed",
  });

  return NextResponse.json({ ok: outcome.ok });
}

async function handleSubscriptionEvent(
  service: ReturnType<typeof getSupabaseServiceClient>,
  sub: SubscriptionEvent
) {
  const userId = sub.metadata?.userId;
  if (!userId) return;
  const planFromPrice = inferPlanFromPriceId(sub.items?.data?.[0]?.price?.id);
  const plan: PlanCode = (sub.metadata?.plan as PlanCode | undefined) ?? planFromPrice ?? "standard";

  await service.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      plan,
      status: sub.status,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (sub.status === "active" || sub.status === "trialing") {
    await service.from("profiles").update({ plan, stripe_customer_id: sub.customer }).eq("id", userId);
  }
}

async function handleSubscriptionDeleted(
  service: ReturnType<typeof getSupabaseServiceClient>,
  sub: SubscriptionEvent
) {
  const userId = sub.metadata?.userId;
  if (!userId) return;
  await service
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq("stripe_subscription_id", sub.id);

  await service.from("profiles").update({ plan: "free" }).eq("id", userId);
}

async function handleInvoicePayment(
  service: ReturnType<typeof getSupabaseServiceClient>,
  invoice: Stripe.Invoice
) {
  const meta = readInvoiceMetadata(invoice);
  const userId = meta.userId;
  if (!userId) return;

  const amountCents = invoice.amount_paid ?? 0;
  if (amountCents <= 0) return;

  const { data: payment } = await service
    .from("payments")
    .insert({
      user_id: userId,
      amount_cents: amountCents,
      currency: invoice.currency ?? "eur",
      status: "succeeded",
      stripe_invoice_id: invoice.id ?? null,
      stripe_payment_intent_id: readPaymentIntentId(invoice),
    })
    .select("id")
    .single();

  if (payment) {
    const issued = new Date();
    const invoiceNumber = `FA-${issued.getFullYear()}-${String(Date.now()).slice(-6)}`;
    await service.from("invoices").insert({
      payment_id: payment.id,
      invoice_number: invoiceNumber,
      issued_at: issued.toISOString(),
      legal_mention: "TVA non applicable, art. 293B du CGI",
    });
  }

  // KARMA split 50/10/40 (CLAUDE.md §35.1) — appliqué sur chaque paiement réussi
  if (payment) {
    try {
      await splitRevenue(service, {
        amountCents,
        paymentId: payment.id as string,
        sourceLabel: "stripe_invoice_payment_succeeded",
      });
    } catch (err) {
      console.error("[karma] split failed:", err);
      // On ne bloque pas le webhook si KARMA échoue — log + Sentry côté app
    }
  }

  // Commission parrainage : 50 % du premier paiement (V4)
  const referralCode = meta.referralCode;
  if (referralCode) {
    await maybeCreateReferralCommission(service, userId, amountCents, referralCode);
  }
}

function readInvoiceMetadata(invoice: Stripe.Invoice): {
  userId?: string;
  referralCode?: string;
} {
  const direct = (invoice.metadata ?? {}) as Record<string, string>;
  const fromInvoice = { userId: direct.userId, referralCode: direct.referralCode };
  if (fromInvoice.userId) return fromInvoice;
  // Stripe API ≥ 2024-09 expose `subscription_details.metadata` ; antérieur via `lines.data[*].metadata`
  const inv = invoice as unknown as {
    subscription_details?: { metadata?: Record<string, string> };
    lines?: { data?: Array<{ metadata?: Record<string, string> }> };
  };
  const subMeta = inv.subscription_details?.metadata ?? inv.lines?.data?.[0]?.metadata ?? {};
  return {
    userId: subMeta.userId,
    referralCode: subMeta.referralCode ?? fromInvoice.referralCode,
  };
}

function readPaymentIntentId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as unknown as {
    payment_intent?: string | { id?: string } | null;
    payments?: { data?: Array<{ payment_intent?: string | { id?: string } | null }> };
  };
  const direct = inv.payment_intent;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object" && typeof direct.id === "string") return direct.id;
  const fromList = inv.payments?.data?.[0]?.payment_intent;
  if (typeof fromList === "string") return fromList;
  if (fromList && typeof fromList === "object" && typeof fromList.id === "string") return fromList.id;
  return null;
}

async function handleInvoiceFailed(
  service: ReturnType<typeof getSupabaseServiceClient>,
  invoice: Stripe.Invoice
) {
  const userId = (invoice.metadata as Record<string, string> | null)?.userId;
  if (!userId) return;
  await service.from("payments").insert({
    user_id: userId,
    amount_cents: invoice.amount_due ?? 0,
    currency: invoice.currency ?? "eur",
    status: "failed",
    stripe_invoice_id: invoice.id,
  });
}

async function maybeCreateReferralCommission(
  service: ReturnType<typeof getSupabaseServiceClient>,
  newUserId: string,
  amountCents: number,
  referralCode: string
) {
  const { data: referrer } = await service
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .maybeSingle();
  if (!referrer || referrer.id === newUserId) return;

  // Crée la relation referrals si inexistante
  const { data: refRow } = await service
    .from("referrals")
    .upsert(
      {
        referrer_user_id: referrer.id,
        referred_user_id: newUserId,
        status: "converted",
        converted_at: new Date().toISOString(),
        level: 1,
      },
      { onConflict: "referrer_user_id,referred_user_id" }
    )
    .select("id")
    .single();
  if (!refRow) return;

  // Évite la double commission sur le même referral_id
  const { data: existing } = await service
    .from("commissions")
    .select("id")
    .eq("referral_id", refRow.id)
    .eq("type", "subscription_first")
    .maybeSingle();
  if (existing) return;

  const commissionCents = Math.round(amountCents * 0.5);
  await service.from("commissions").insert({
    referral_id: refRow.id,
    user_id: referrer.id,
    amount_cents: commissionCents,
    currency: "eur",
    type: "subscription_first",
    status: "pending",
  });

  // Crédit wallet en attente (sera released après période rétractation 30j)
  await service.from("wallet_transactions").insert({
    user_id: referrer.id,
    type: "credit_cash",
    amount: commissionCents,
    currency: "eur",
    reason: "referral_first_payment",
    metadata: {
      referral_id: refRow.id,
      release_after: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      status: "pending",
    },
  });
}

function inferPlanFromPriceId(priceId: string | undefined): PlanCode | undefined {
  if (!priceId) return undefined;
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.code;
  }
  return undefined;
}
