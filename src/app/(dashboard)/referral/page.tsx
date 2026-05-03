import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Parrainage",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/referral");

  const [{ data: profile }, { count: invitedCount }, { count: convertedCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, referral_code").eq("id", user.id).maybeSingle(),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", user.id),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", user.id)
      .eq("status", "converted"),
  ]);

  const displayName =
    (profile as { full_name?: string } | null)?.full_name ??
    user.email?.split("@")[0] ??
    "Toi";
  const referralCode = (profile as { referral_code?: string } | null)?.referral_code ?? "";
  const referralUrl = `https://{{SLUG}}.purama.dev/?ref=${referralCode}`;

  return (
    <>
      <AppHeader displayName={displayName} email={user.email} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">Parrainage</h1>
          <p className="text-[var(--muted)] text-sm">
            50 % du premier paiement de ton filleul. Crédité sur ton wallet après 30 jours.
          </p>
        </header>

        <section className="glass p-6 space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-[var(--muted)]">Mon lien</h2>
          <p className="font-mono text-lg gradient-text break-all">{referralUrl}</p>
          <p className="text-xs text-[var(--muted)]">
            Code : <span className="font-mono text-[var(--foreground)]">{referralCode}</span>
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="glass p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Invités</p>
            <p className="text-3xl font-semibold gradient-text">{invitedCount ?? 0}</p>
          </div>
          <div className="glass p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Convertis</p>
            <p className="text-3xl font-semibold gradient-text">{convertedCount ?? 0}</p>
          </div>
        </section>

        <section className="glass p-6 space-y-3 text-sm text-[var(--muted)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Comment ça marche</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tu partages ton lien à un ami.</li>
            <li>Il s&apos;inscrit et démarre un essai (14 jours).</li>
            <li>Quand il devient payant, tu reçois 50 % de son premier paiement.</li>
            <li>Crédit visible immédiatement, déblocage IBAN après 30 jours (rétractation).</li>
          </ol>
        </section>
      </main>
    </>
  );
}
