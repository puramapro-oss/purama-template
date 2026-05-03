/**
 * CRON — Confirmation des commissions parrainage à J+30 (RGPD/rétractation L221-28).
 *
 * Quotidien 02:00 UTC. Lit {{SLUG}}.commissions status='pending' AND
 * created_at <= now() - 30 days. Pour chacune :
 *   1. Marque commission status='paid', paid_at = now().
 *   2. Convertit le pending → confirmed dans wallet_transactions metadata
 *      (le crédit lui-même reste — on flag juste).
 *   3. Si la commission concerne un user qui a annulé sa sub <30j → status
 *      'cancelled' (clawback) plutôt que 'paid'.
 */

import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CommissionRow {
  id: string;
  referral_id: string;
  user_id: string;
  amount_cents: number;
  type: string;
  created_at: string;
}

interface ReferralRow {
  id: string;
  referred_user_id: string;
}

interface SubscriptionRow {
  user_id: string;
  status: string;
  cancel_at_period_end: boolean | null;
}

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  const authError = assertCronAuth(request);
  if (authError) return authError;

  const service = getSupabaseServiceClient();
  const startedAt = Date.now();
  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const { data: pending, error: cErr } = await service
    .from("commissions")
    .select("id, referral_id, user_id, amount_cents, type, created_at")
    .eq("status", "pending")
    .lte("created_at", cutoff)
    .limit(500);
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const list = (pending ?? []) as CommissionRow[];
  if (list.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, note: "no pending commission ripe" });
  }

  // Pour clawback : statut sub du filleul aujourd'hui
  const referralIds = Array.from(new Set(list.map((c) => c.referral_id)));
  const { data: refs } = await service
    .from("referrals")
    .select("id, referred_user_id")
    .in("id", referralIds);
  const referredByRef = new Map<string, string>();
  for (const r of (refs ?? []) as ReferralRow[]) {
    referredByRef.set(r.id, r.referred_user_id);
  }

  const refUserIds = Array.from(new Set(Array.from(referredByRef.values())));
  const subStatusByUser = new Map<string, SubscriptionRow>();
  if (refUserIds.length > 0) {
    const { data: subs } = await service
      .from("subscriptions")
      .select("user_id, status, cancel_at_period_end")
      .in("user_id", refUserIds);
    for (const s of (subs ?? []) as SubscriptionRow[]) {
      subStatusByUser.set(s.user_id, s);
    }
  }

  let paid = 0;
  let cancelled = 0;
  const nowIso = new Date().toISOString();

  for (const com of list) {
    const referredUserId = referredByRef.get(com.referral_id);
    const sub = referredUserId ? subStatusByUser.get(referredUserId) : undefined;
    const isClawback =
      sub && (sub.status === "canceled" || sub.status === "incomplete_expired" || sub.cancel_at_period_end === true);

    if (isClawback) {
      await service.from("commissions").update({ status: "cancelled" }).eq("id", com.id);
      await service.from("wallet_transactions").insert({
        user_id: com.user_id,
        type: "refund",
        amount: -com.amount_cents,
        currency: "eur",
        reason: "commission_clawback",
        metadata: { commission_id: com.id, referral_id: com.referral_id },
      });
      cancelled += 1;
    } else {
      await service.from("commissions").update({ status: "paid", paid_at: nowIso }).eq("id", com.id);
      await service.from("wallet_transactions").insert({
        user_id: com.user_id,
        type: "credit_cash",
        amount: com.amount_cents,
        currency: "eur",
        reason: "commission_unlocked",
        metadata: { commission_id: com.id, referral_id: com.referral_id, commission_type: com.type },
      });
      paid += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: list.length,
    paid,
    cancelled,
    runMs: Date.now() - startedAt,
  });
}
