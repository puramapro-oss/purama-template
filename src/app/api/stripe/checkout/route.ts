/**
 * POST /api/stripe/checkout
 *   Body: { plan: 'standard' | 'premium' }
 *   Crée une checkout session (mock ou réelle) et renvoie l'URL.
 *   Lit le cookie de parrainage `{{SLUG}}_ref` pour propager au webhook.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase-server";
import { createCheckoutSession, isStripeMocked } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["standard", "premium"]),
});

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const referralCode = cookieStore.get("{{SLUG}}_ref")?.value;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const successUrl = `${baseUrl}/app/abonnement?status=success`;
  const cancelUrl = `${baseUrl}/pricing?status=cancelled`;

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email ?? "",
      plan: parsed.data.plan,
      successUrl,
      cancelUrl,
      referralCode,
    });

    // En mock-mode, on simule le succès immédiatement côté DB pour offrir
    // un parcours testable sans Stripe live.
    if (session.mocked) {
      const trialEnd = new Date(Date.now() + 14 * 24 * 3600 * 1000);
      const periodEnd = new Date(Date.now() + 44 * 24 * 3600 * 1000);
      await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_subscription_id: session.sessionId,
          stripe_customer_id: `cus_mock_${user.id.slice(0, 8)}`,
          plan: parsed.data.plan,
          status: "trialing",
          trial_end: trialEnd.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        },
        { onConflict: "user_id" }
      );
      await supabase
        .from("profiles")
        .update({
          plan: parsed.data.plan,
          stripe_customer_id: `cus_mock_${user.id.slice(0, 8)}`,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.sessionId,
      mocked: session.mocked || isStripeMocked(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Création de la session impossible.",
        debug: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
