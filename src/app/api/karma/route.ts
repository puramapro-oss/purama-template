/**
 * GET /api/karma
 *   Renvoie les soldes des 3 pools KARMA + le solde wallet de l'utilisateur connecté.
 *   Lecture seule. Lecture libre côté client mais enrichie si auth.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer, getSupabaseServiceClient } from "@/lib/supabase-server";
import { getPoolBalances } from "@/lib/karma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const service = getSupabaseServiceClient();
  const pools = await getPoolBalances(service);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userWallet: { points: number; cashCents: number } | null = null;
  if (user) {
    const { data: wallet } = await supabase
      .from("wallets")
      .select("points_balance, cash_balance_cents")
      .eq("user_id", user.id)
      .maybeSingle();
    userWallet = {
      points: ((wallet as { points_balance?: number } | null)?.points_balance ?? 0) as number,
      cashCents: ((wallet as { cash_balance_cents?: number } | null)?.cash_balance_cents ??
        0) as number,
    };
  }

  return NextResponse.json({
    ok: true,
    pools: {
      users_pool: pools.users,
      asso_pool: pools.asso,
      sasu_pool: pools.sasu,
    },
    user_wallet: userWallet,
  });
}
