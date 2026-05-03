"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CONSENT_DEFINITIONS, type ConsentType } from "@/lib/consents";
import { getSupabaseBrowser } from "@/lib/supabase";

interface ParametresControlsProps {
  initial: Record<ConsentType, boolean>;
}

export function ParametresControls({ initial }: ParametresControlsProps) {
  const router = useRouter();
  const [state, setState] = useState<Record<ConsentType, boolean>>(initial);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = CONSENT_DEFINITIONS.some((c) => state[c.type] !== initial[c.type]);

  const toggle = (type: ConsentType) => {
    setState((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const save = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Session expirée. Reconnecte-toi.");

        const rows = (Object.entries(state) as Array<[ConsentType, boolean]>)
          .filter(([type, granted]) => granted !== initial[type])
          .map(([type, granted]) => ({
            user_id: user.id,
            consent_type: type,
            granted,
            source: "settings",
          }));

        if (rows.length === 0) return;

        const { error: insertError } = await supabase.from("consents").insert(rows);
        if (insertError) throw new Error(insertError.message);

        setSavedAt(new Date());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sauvegarde impossible.");
      }
    });
  };

  const signOut = async () => {
    setSignOutLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      // Clear storage côté browser pour forcer la déconnexion (cf ERRORS.md JURISPURAMA bouton mort)
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        // Storage inaccessible (mode privé) — ignorer.
      }
      window.location.href = "/auth/login";
    } catch (err) {
      setSignOutLoading(false);
      setError(err instanceof Error ? err.message : "Déconnexion impossible.");
    }
  };

  return (
    <>
      <section className="glass rounded-[var(--radius-lg)] p-6 mb-6" data-testid="consents-panel">
        <h2 className="font-semibold text-2xl mb-2">Mes consentements</h2>
        <p className="text-sm text-[var(--muted)] mb-5 leading-relaxed">
          Active ou retire chaque autorisation à tout moment. Les retraits sont effectifs immédiatement
          côté affichage et sous 24 h en base.
        </p>
        <div className="flex flex-col gap-3">
          {CONSENT_DEFINITIONS.map((def) => (
            <label
              key={def.type}
              htmlFor={`set-${def.type}`}
              className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)] cursor-pointer hover:border-[var(--primary-soft)] transition-colors"
            >
              <input
                id={`set-${def.type}`}
                type="checkbox"
                checked={state[def.type]}
                onChange={() => toggle(def.type)}
                className="mt-1 w-5 h-5 accent-[var(--primary)] cursor-pointer"
                data-testid={`set-${def.type}`}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-[var(--foreground)]">{def.label}</span>
                <span className="block text-xs text-[var(--muted)]">{def.description}</span>
              </span>
            </label>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save} disabled={!isDirty || pending} loading={pending} data-testid="save-consents">
            Enregistrer
          </Button>
          {savedAt && !pending && (
            <span className="text-xs text-[var(--secondary-soft)]">
              Sauvegardé à {savedAt.toLocaleTimeString("fr-FR")}.
            </span>
          )}
        </div>
      </section>

      <section className="glass rounded-[var(--radius-lg)] p-6">
        <h2 className="font-semibold text-2xl mb-2">Session</h2>
        <Button
          variant="outline"
          onClick={signOut}
          loading={signOutLoading}
          data-testid="signout-button"
        >
          Se déconnecter
        </Button>
      </section>
    </>
  );
}
