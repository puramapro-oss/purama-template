import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Accueil",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, referral_code, wallet_balance, tutorial_completed")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    (profile as { full_name?: string } | null)?.full_name ??
    user.email?.split("@")[0] ??
    "Toi";

  if (!(profile as { tutorial_completed?: boolean } | null)?.tutorial_completed) {
    redirect("/onboarding");
  }

  return (
    <>
      <AppHeader displayName={displayName} email={user.email} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            Bonjour {displayName} 👋
          </h1>
          <p className="text-[var(--muted)]">
            Voici ton tableau de bord {"{{APP_NAME}}"}. Personnalise ce contenu selon
            les features de ton app après bootstrap.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashCard
            href="/wallet"
            title="Wallet"
            value={`${(((profile as { wallet_balance?: number } | null)?.wallet_balance ?? 0) / 100).toFixed(2)} €`}
            label="Solde"
          />
          <DashCard
            href="/referral"
            title="Parrainage"
            value={(profile as { referral_code?: string } | null)?.referral_code ?? "—"}
            label="Mon code"
          />
          <DashCard
            href="/parametres"
            title="Plan"
            value={(profile as { plan?: string } | null)?.plan ?? "free"}
            label="Abonnement"
          />
        </section>

        <section className="glass p-6">
          <h2 className="text-xl font-semibold mb-4">Bienvenue dans {"{{APP_NAME}}"}</h2>
          <p className="text-[var(--muted)] mb-4">
            C&apos;est ici que tu construis l&apos;UI principale de ton app après bootstrap.
            Remplace ce placeholder avec les features définies dans ton BRIEF.md.
          </p>
          <div className="flex gap-3">
            <Link href="/pricing" className="btn-secondary">
              Voir les plans
            </Link>
            <Link href="/parametres" className="btn-secondary">
              Paramètres
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function DashCard({
  href,
  title,
  value,
  label,
}: {
  href: string;
  title: string;
  value: string;
  label: string;
}) {
  return (
    <Link href={href} className="glass glass-hover p-5 block">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">{title}</p>
      <p className="text-2xl font-semibold gradient-text">{value}</p>
      <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
    </Link>
  );
}
