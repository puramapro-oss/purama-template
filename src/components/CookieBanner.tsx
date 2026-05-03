"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const COOKIE_NAME = "{{SLUG}}_cookie_choice";
const ANALYTICS_COOKIE = "analytics_ok";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const choice = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!choice) setOpen(true);
  }, []);

  const setChoice = (value: "all" | "essential") => {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
    if (value === "all") {
      document.cookie = `${ANALYTICS_COOKIE}=1; path=/; max-age=${oneYear}; SameSite=Lax`;
    } else {
      document.cookie = `${ANALYTICS_COOKIE}=0; path=/; max-age=${oneYear}; SameSite=Lax`;
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 glass rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-medium)]"
      data-testid="cookie-banner"
    >
      <p className="text-sm text-[var(--foreground)] mb-3 leading-relaxed">
        On utilise des cookies essentiels au fonctionnement (session, sécurité). Pour nous aider
        à améliorer {{APP_NAME}}, tu peux accepter les cookies d'analytics (anonymisés).
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        <Button size="sm" onClick={() => setChoice("all")} data-testid="cookie-accept">
          Tout accepter
        </Button>
        <Button size="sm" variant="outline" onClick={() => setChoice("essential")} data-testid="cookie-essential">
          Essentiels uniquement
        </Button>
      </div>
      <p className="text-[10px] text-[var(--muted)]">
        Modifiable plus tard depuis{" "}
        <Link href="/parametres" className="underline">Paramètres</Link>. Voir{" "}
        <Link href="/legal/confidentialite" className="underline">politique de confidentialité</Link>.
      </p>
    </div>
  );
}
