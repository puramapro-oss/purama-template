/**
 * {{APP_NAME}} — KARMA module (Wealth Engine)
 * ============================================================================
 * Split universel des revenus Stripe (CLAUDE.md §35.1) :
 *
 *   50 %  → users_pool   (redistribué : parrainage, classement, tirages, missions)
 *   10 %  → asso_pool    (Association PURAMA — mécénat / 60% IS réduction)
 *   40 %  → sasu_pool    (SASU PURAMA — opérationnel)
 *
 * Total : 100 %. Vérifié au runtime, throw si décalage >1c.
 *
 * Trigger : webhook Stripe `invoice.payment_succeeded` → splitRevenue() →
 * 3 inserts dans pool_transactions + update pool_balances.
 *
 * Tables (cf migrations/001_template_init.sql) :
 *   - karma_pools(pool_type ENUM, balance_cents, total_in_cents, total_out_cents)
 *   - pool_transactions(pool_type, amount_cents, direction, reason, ref_payment_id)
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type PoolType = "users" | "asso" | "sasu";

export interface KarmaSplit {
  totalCents: number;
  usersCents: number;
  assoCents: number;
  sasuCents: number;
}

/**
 * Calcule le split 50/10/40 d'un montant en centimes.
 * Reliquat de centimes (arrondi) → SASU pool (responsable du surplus).
 */
export function computeKarmaSplit(amountCents: number): KarmaSplit {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error(`[karma] amountCents doit être un entier positif, reçu: ${amountCents}`);
  }
  const usersCents = Math.floor(amountCents * 0.5);
  const assoCents = Math.floor(amountCents * 0.1);
  const sasuCents = amountCents - usersCents - assoCents;

  if (usersCents + assoCents + sasuCents !== amountCents) {
    throw new Error(`[karma] split incohérent: ${usersCents}+${assoCents}+${sasuCents} ≠ ${amountCents}`);
  }
  return { totalCents: amountCents, usersCents, assoCents, sasuCents };
}

export type SupabaseLike = SupabaseClient<unknown, string, never>;

/**
 * Applique le split d'un revenu Stripe sur les 3 pools.
 * Idempotent par `paymentId` : si une row pool_transaction existe déjà
 * avec ref_payment_id=paymentId et reason='ca_split', on skip.
 *
 * @returns { applied: boolean, split: KarmaSplit | null }
 */
export async function splitRevenue(
  supabase: SupabaseLike,
  opts: { amountCents: number; paymentId: string; sourceLabel?: string },
): Promise<{ applied: boolean; split: KarmaSplit | null }> {
  // Idempotence
  const { data: existing } = await supabase
    .from("pool_transactions")
    .select("id")
    .eq("ref_payment_id", opts.paymentId)
    .eq("reason", "ca_split")
    .maybeSingle();
  if (existing) return { applied: false, split: null };

  const split = computeKarmaSplit(opts.amountCents);
  const now = new Date().toISOString();

  const rows = [
    {
      pool_type: "users" as const,
      amount_cents: split.usersCents,
      direction: "in" as const,
      reason: "ca_split",
      ref_payment_id: opts.paymentId,
      source_label: opts.sourceLabel ?? "stripe_invoice",
      created_at: now,
    },
    {
      pool_type: "asso" as const,
      amount_cents: split.assoCents,
      direction: "in" as const,
      reason: "ca_split",
      ref_payment_id: opts.paymentId,
      source_label: opts.sourceLabel ?? "stripe_invoice",
      created_at: now,
    },
    {
      pool_type: "sasu" as const,
      amount_cents: split.sasuCents,
      direction: "in" as const,
      reason: "ca_split",
      ref_payment_id: opts.paymentId,
      source_label: opts.sourceLabel ?? "stripe_invoice",
      created_at: now,
    },
  ];

  const { error: txErr } = await supabase.from("pool_transactions").insert(rows);
  if (txErr) throw new Error(`[karma] insert pool_transactions: ${txErr.message}`);

  // Update agrégats karma_pools (3 upserts atomiques)
  for (const r of rows) {
    const { error: poolErr } = await supabase.rpc("karma_credit_pool", {
      p_pool_type: r.pool_type,
      p_amount_cents: r.amount_cents,
    });
    if (poolErr) {
      // Fallback : update manuel si la RPC n'existe pas (mock-mode)
      await supabase
        .from("karma_pools")
        .update({
          balance_cents: (await getPoolBalance(supabase, r.pool_type)) + r.amount_cents,
          total_in_cents: (await getPoolTotalIn(supabase, r.pool_type)) + r.amount_cents,
          updated_at: now,
        })
        .eq("pool_type", r.pool_type);
    }
  }

  return { applied: true, split };
}

async function getPoolBalance(supabase: SupabaseLike, poolType: PoolType): Promise<number> {
  const { data } = await supabase
    .from("karma_pools")
    .select("balance_cents")
    .eq("pool_type", poolType)
    .maybeSingle();
  return ((data as { balance_cents?: number } | null)?.balance_cents ?? 0) as number;
}

async function getPoolTotalIn(supabase: SupabaseLike, poolType: PoolType): Promise<number> {
  const { data } = await supabase
    .from("karma_pools")
    .select("total_in_cents")
    .eq("pool_type", poolType)
    .maybeSingle();
  return ((data as { total_in_cents?: number } | null)?.total_in_cents ?? 0) as number;
}

/**
 * Lecture des soldes courants (read-only).
 */
export async function getPoolBalances(
  supabase: SupabaseLike,
): Promise<Record<PoolType, { balance: number; totalIn: number; totalOut: number }>> {
  const { data } = await supabase
    .from("karma_pools")
    .select("pool_type, balance_cents, total_in_cents, total_out_cents");

  const result: Record<PoolType, { balance: number; totalIn: number; totalOut: number }> = {
    users: { balance: 0, totalIn: 0, totalOut: 0 },
    asso: { balance: 0, totalIn: 0, totalOut: 0 },
    sasu: { balance: 0, totalIn: 0, totalOut: 0 },
  };

  for (const row of (data ?? []) as Array<{
    pool_type: PoolType;
    balance_cents: number;
    total_in_cents: number;
    total_out_cents: number;
  }>) {
    result[row.pool_type] = {
      balance: row.balance_cents ?? 0,
      totalIn: row.total_in_cents ?? 0,
      totalOut: row.total_out_cents ?? 0,
    };
  }

  return result;
}
