import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Wallet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/wallet");

  const [{ data: profile }, { data: wallet }, { data: txs }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("wallets")
      .select("points_balance, cash_balance_cents, total_earned_cents")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("wallet_transactions")
      .select("id, type, amount, currency, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const displayName =
    (profile as { full_name?: string } | null)?.full_name ??
    user.email?.split("@")[0] ??
    "Toi";
  const points = ((wallet as { points_balance?: number } | null)?.points_balance ?? 0) as number;
  const cashCents = ((wallet as { cash_balance_cents?: number } | null)?.cash_balance_cents ??
    0) as number;
  const totalEarnedCents = ((wallet as { total_earned_cents?: number } | null)?.total_earned_cents ??
    0) as number;
  const transactions = (txs ?? []) as Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    reason: string | null;
    created_at: string;
  }>;

  return (
    <>
      <AppHeader displayName={displayName} email={user.email} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">Wallet</h1>
          <p className="text-[var(--muted)] text-sm">
            Solde, historique, retrait IBAN dès 5 €.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Cash</p>
            <p className="text-3xl font-semibold gradient-text">
              {(cashCents / 100).toFixed(2).replace(".", ",")} €
            </p>
            <p className="text-xs text-[var(--muted)] mt-2">
              Total gagné depuis l&apos;inscription : {(totalEarnedCents / 100).toFixed(2).replace(".", ",")} €
            </p>
          </div>
          <div className="glass p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Points</p>
            <p className="text-3xl font-semibold gradient-text">{points.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-[var(--muted)] mt-2">
              Échange tes points contre des réductions ou tickets.
            </p>
          </div>
        </section>

        <section className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Historique</h2>
            <Link href="/referral" className="text-xs text-[var(--primary)] hover:underline">
              Gagner plus →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Aucune transaction pour le moment. Parraine un ami pour gagner tes premiers euros.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {transactions.map((tx) => (
                <li key={tx.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-[var(--foreground)]">{tx.reason ?? tx.type}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p
                    className={`font-mono font-semibold ${
                      tx.type.startsWith("credit") ? "text-[var(--secondary)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {tx.type.startsWith("credit") ? "+" : "−"}
                    {tx.currency === "eur"
                      ? `${(tx.amount / 100).toFixed(2)} €`
                      : `${tx.amount} pts`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
