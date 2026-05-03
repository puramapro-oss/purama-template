"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_DEFINITIONS, type ConsentType } from "@/lib/consents";
import { getSupabaseBrowser } from "@/lib/supabase";

type Step = "intro" | "consents" | "saving";

interface OnboardingFlowProps {
  defaultName: string;
}

/**
 * Onboarding minimal générique : intro + consentements RGPD.
 * Étends avec des étapes domaine-spécifiques (intention, état, contexte) après bootstrap.
 */
export function OnboardingFlow({ defaultName }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>(
    () =>
      Object.fromEntries(CONSENT_DEFINITIONS.map((c) => [c.type, false])) as Record<
        ConsentType,
        boolean
      >,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleConsent = (type: ConsentType) => {
    setConsents((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const finalize = async () => {
    setSaveError(null);
    setStep("saving");
    try {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée. Reconnecte-toi.");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          tutorial_completed: true,
          metadata: { onboarded_at: new Date().toISOString() },
        })
        .eq("id", user.id);
      if (profileError) throw new Error(profileError.message);

      const consentRows = (Object.entries(consents) as Array<[ConsentType, boolean]>).map(
        ([type, granted]) => ({
          user_id: user.id,
          consent_type: type,
          granted,
          source: "onboarding",
        }),
      );
      const { error: consentError } = await supabase.from("consents").insert(consentRows);
      if (consentError) throw new Error(consentError.message);

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inattendue.");
      setStep("consents");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="glass w-full max-w-xl p-8 sm:p-10">
        <ProgressDots step={step} />

        {step === "intro" && (
          <Intro defaultName={defaultName} onContinue={() => setStep("consents")} />
        )}

        {step === "consents" && (
          <ConsentsStep
            consents={consents}
            onToggle={toggleConsent}
            onBack={() => setStep("intro")}
            onSubmit={finalize}
            error={saveError}
          />
        )}

        {step === "saving" && (
          <div className="py-12 text-center" data-testid="onboarding-saving">
            <div className="inline-block w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[var(--muted)]">On finalise ton espace…</p>
          </div>
        )}
      </section>
    </main>
  );
}

function ProgressDots({ step }: { step: Step }) {
  const order: Step[] = ["intro", "consents"];
  const idx = order.indexOf(step);
  return (
    <div className="flex justify-center gap-2 mb-8" aria-hidden="true">
      {order.map((_, i) => (
        <span
          key={i}
          className={
            "h-1.5 rounded-full transition-all " +
            (i === idx
              ? "w-8 bg-[var(--primary)]"
              : i < idx
                ? "w-1.5 bg-[var(--secondary)]"
                : "w-1.5 bg-[var(--border)]")
          }
        />
      ))}
    </div>
  );
}

function Intro({ defaultName, onContinue }: { defaultName: string; onContinue: () => void }) {
  return (
    <div data-testid="onboarding-intro">
      <h1 className="text-4xl font-semibold text-[var(--foreground)] leading-tight mb-4">
        {defaultName ? `Bienvenue, ${defaultName}.` : "Bienvenue."}
      </h1>
      <p className="text-[var(--muted)] leading-relaxed mb-8">
        {"{{APP_NAME}}"} est un espace pensé pour toi. Avant de commencer, on te demande
        ton accord pour quelques traitements de données. Tout est révocable à tout
        moment dans tes Paramètres.
      </p>
      <Button size="lg" fullWidth onClick={onContinue} data-testid="onboarding-start">
        Commencer
      </Button>
    </div>
  );
}

interface ConsentsStepProps {
  consents: Record<ConsentType, boolean>;
  onToggle: (type: ConsentType) => void;
  onBack: () => void;
  onSubmit: () => void;
  error: string | null;
}

function ConsentsStep({ consents, onToggle, onBack, onSubmit, error }: ConsentsStepProps) {
  return (
    <div data-testid="onboarding-consents">
      <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2 leading-tight">
        Ce que tu acceptes
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
        Aucune case n&apos;est cochée par défaut — c&apos;est ton choix, et tu peux tout
        révoquer dans <strong className="text-[var(--foreground)]">Paramètres</strong>.
      </p>
      <div className="flex flex-col gap-3 mb-6 max-h-[50vh] overflow-y-auto pr-2">
        {CONSENT_DEFINITIONS.map((def) => (
          <label
            key={def.type}
            htmlFor={`consent-${def.type}`}
            className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors"
          >
            <input
              id={`consent-${def.type}`}
              type="checkbox"
              checked={consents[def.type]}
              onChange={() => onToggle(def.type)}
              className="mt-1 w-5 h-5 accent-[var(--primary)] cursor-pointer"
              data-testid={`consent-${def.type}`}
            />
            <span className="flex-1">
              <span className="block text-sm font-medium text-[var(--foreground)] mb-0.5">
                {def.label}
                {def.art9 && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--primary)]">
                    données sensibles
                  </span>
                )}
              </span>
              <span className="block text-xs text-[var(--muted)] leading-relaxed">
                {def.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p
          className="text-sm text-red-500 mb-4"
          role="alert"
          data-testid="onboarding-error"
        >
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack}>
          Retour
        </Button>
        <Button size="lg" fullWidth onClick={onSubmit} data-testid="onboarding-submit">
          Entrer dans {"{{APP_NAME}}"}
        </Button>
      </div>
    </div>
  );
}
