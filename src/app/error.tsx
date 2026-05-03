"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="glass w-full max-w-md p-8 text-center">
        <p className="text-6xl gradient-text font-semibold">!</p>
        <h1 className="mt-2 text-2xl font-semibold">Quelque chose ne s&apos;est pas passé comme prévu.</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Une erreur est survenue côté serveur. L&apos;équipe est notifiée. Tu peux réessayer dans quelques instants.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-[var(--muted)]">ref · {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Réessayer
          </button>
          <a href="/" className="btn-secondary">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </main>
  );
}
