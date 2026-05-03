import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à {{APP_NAME}} pour reprendre ton accompagnement.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const safeNext = sanitizeNext(next);
  const appleMocked = process.env.MOCK_APPLE_AUTH === "true";

  return (
    <AuthCard
      title="Bon retour parmi nous"
      subtitle="Connecte-toi pour retrouver ton espace."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href={`/auth/signup${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`}
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Crée le tien
          </Link>
        </>
      }
    >
      {error && <ErrorBanner code={error} />}

      <Suspense fallback={null}>
        <LoginForm nextPath={safeNext} />
      </Suspense>

      <div className="my-5 flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="flex-1 h-px bg-[var(--border)]" />
        ou
        <span className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <OAuthButtons next={safeNext} appleMocked={appleMocked} />

      <p className="mt-6 text-center text-xs">
        <Link href="/auth/forgot-password" className="text-[var(--muted)] hover:text-[var(--foreground)] underline-offset-4 hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
    </AuthCard>
  );
}

function ErrorBanner({ code }: { code: string }) {
  const message =
    code === "oauth_failed"
      ? "La connexion via le fournisseur a échoué. Réessaie ou utilise email + mot de passe."
      : code === "session_expired"
      ? "Ta session a expiré. Reconnecte-toi pour continuer."
      : "Une erreur est survenue. Réessaie dans un instant.";
  return (
    <div className="mb-5 rounded-[var(--radius-md)] border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-200" role="alert">
      {message}
    </div>
  );
}

function sanitizeNext(next: string | undefined): string {
  if (!next) return "/app";
  // Empêche les open redirects : seuls les paths internes commençant par '/' sans '//' sont autorisés.
  if (!next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}
