import Link from "next/link";
import { type ReactNode } from "react";

const LEGAL_NAV: Array<{ href: string; label: string }> = [
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/cgu", label: "CGU" },
];

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-6 h-6 rounded-full"
              style={{ background: "var(--gradient-primary)" }}
              aria-hidden="true"
            />
            <span className="font-semibold text-lg">{"{{APP_NAME}}"}</span>
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <nav className="mb-8 flex flex-wrap gap-2 text-xs">
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article>
          <h1 className="text-4xl font-semibold text-[var(--foreground)] mb-2 leading-tight">
            {title}
          </h1>
          <p className="text-xs text-[var(--muted)] mb-8">
            Dernière mise à jour : {updatedAt}
          </p>
          <div className="space-y-4 text-[var(--foreground)] leading-relaxed">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}
