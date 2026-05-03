import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";
import { getSupabaseServer } from "@/lib/supabase-server";
import { CheckoutButton } from "./CheckoutButton";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Standard 9.99€/mois ou Premium 19.99€/mois. 14 jours d'essai. Annulation à tout moment.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);

  let activePlan: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();
    activePlan = profile?.plan ?? null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)]">Tarifs</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--foreground)] leading-tight">
            Deux plans. Pas de stress.
          </h1>
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            14 jours d&apos;essai gratuit. Annulation à tout moment depuis ton espace.
            TVA non applicable (art. 293B du CGI).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <PlanCard
            plan={PLANS.standard}
            isAuthed={isAuthed}
            activePlan={activePlan}
            highlighted={false}
          />
          <PlanCard
            plan={PLANS.premium}
            isAuthed={isAuthed}
            activePlan={activePlan}
            highlighted={true}
          />
        </div>

        <section className="max-w-3xl mx-auto glass p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">À savoir</h2>
          <ul className="text-sm text-[var(--muted)] space-y-2">
            <li>
              <strong className="text-[var(--foreground)]">Rétractation :</strong> en
              démarrant ton essai, tu acceptes que la prestation numérique commence
              immédiatement (art. L221-28 3° du Code de la consommation). Le droit de
              rétractation de 14 jours ne s&apos;applique donc pas — mais tu peux
              annuler à tout moment, et tu gardes l&apos;accès jusqu&apos;à la fin du
              cycle payé.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Annulation :</strong> en un
              clic depuis <span className="font-mono">/parametres</span>. Aucune
              question, aucun ticket support à ouvrir.
            </li>
          </ul>
          <p className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
            <Link href="/legal/cgv" className="hover:text-[var(--foreground)]">
              CGV
            </Link>{" "}
            ·{" "}
            <Link href="/legal/cgu" className="hover:text-[var(--foreground)]">
              CGU
            </Link>{" "}
            ·{" "}
            <Link href="/legal/confidentialite" className="hover:text-[var(--foreground)]">
              Confidentialité
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isAuthed,
  activePlan,
  highlighted,
}: {
  plan: (typeof PLANS)[keyof typeof PLANS];
  isAuthed: boolean;
  activePlan: string | null;
  highlighted: boolean;
}) {
  const isActive = activePlan === plan.code;
  const priceEuro = (plan.priceCents / 100).toFixed(2).replace(".", ",");
  return (
    <article
      className={`glass p-6 sm:p-7 space-y-4 ${
        highlighted ? "ring-2 ring-[var(--primary)] shadow-[var(--shadow-medium)]" : ""
      }`}
    >
      <header className="space-y-1">
        {highlighted && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--secondary)]">
            ⭐ Recommandé
          </p>
        )}
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">{plan.label}</h2>
        <p className="text-4xl font-semibold text-[var(--foreground)]">
          {priceEuro}€
          <span className="text-base text-[var(--muted)] font-normal"> /mois</span>
        </p>
        <p className="text-xs text-[var(--primary)]">
          {plan.trialDays} jours d&apos;essai gratuit
        </p>
      </header>

      <ul className="space-y-2 text-sm">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[var(--foreground)]">
            <span aria-hidden="true" className="text-[var(--secondary)] mt-0.5">
              ✓
            </span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      {isActive ? (
        <Link
          href="/parametres"
          className="block text-center px-5 py-3 rounded-full bg-[var(--secondary)]/15 text-[var(--secondary)] font-medium"
        >
          Plan actif · Gérer
        </Link>
      ) : isAuthed ? (
        <CheckoutButton plan={plan.code} highlighted={highlighted} />
      ) : (
        <Link
          href={`/signup?plan=${plan.code}`}
          className={`block text-center w-full ${highlighted ? "btn-primary" : "btn-secondary"}`}
        >
          Démarrer mon essai
        </Link>
      )}
    </article>
  );
}
