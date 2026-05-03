"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase";

export interface OAuthButtonsProps {
  /** Where to send the user after the OAuth dance. Default `/app`. */
  next?: string;
  /** When true, the Apple button is rendered but disabled with "bientôt disponible". */
  appleMocked?: boolean;
}

export function OAuthButtons({ next = "/app", appleMocked = false }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInWith = async (provider: "google" | "apple") => {
    setError(null);
    setLoading(provider);
    try {
      const supabase = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: false },
      });
      if (oauthError) {
        setError(traduireErreurOAuth(oauthError.message, provider));
        setLoading(null);
      }
      // Sinon le navigateur va être redirigé par Supabase.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue, réessaie dans un instant.");
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3" data-testid="oauth-buttons">
      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={() => signInWith("google")}
        loading={loading === "google"}
        disabled={loading !== null}
        leftIcon={<GoogleIcon />}
        data-testid="oauth-google"
      >
        Continuer avec Google
      </Button>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={() => !appleMocked && signInWith("apple")}
        loading={loading === "apple"}
        disabled={loading !== null || appleMocked}
        leftIcon={<AppleIcon />}
        data-testid="oauth-apple"
        title={appleMocked ? "Bientôt disponible — en attente de notre numéro Apple Developer." : undefined}
      >
        {appleMocked ? "Apple (bientôt disponible)" : "Continuer avec Apple"}
      </Button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function traduireErreurOAuth(raw: string, provider: string): string {
  if (raw.toLowerCase().includes("provider") && raw.toLowerCase().includes("not enabled")) {
    return `Le fournisseur ${provider === "google" ? "Google" : "Apple"} n'est pas encore activé sur ce serveur. Réessaie dans quelques instants ou contacte le support.`;
  }
  if (raw.toLowerCase().includes("network")) {
    return "Connexion réseau interrompue. Vérifie ta connexion et réessaie.";
  }
  return "La connexion a échoué. Réessaie ou utilise ton email + mot de passe.";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7a5.41 5.41 0 0 1 0-3.4V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A8.96 8.96 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.34C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
