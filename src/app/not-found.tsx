import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="glass w-full max-w-md p-8 text-center">
        <p className="text-7xl gradient-text font-semibold">404</p>
        <h1 className="mt-4 text-2xl font-semibold">
          Cette page n&apos;existe pas.
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Le lien que tu as suivi ne mène nulle part. Reviens à l&apos;accueil ou ouvre ton espace si tu es connecté·e.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Mon espace
          </Link>
        </div>
      </div>
    </main>
  );
}
