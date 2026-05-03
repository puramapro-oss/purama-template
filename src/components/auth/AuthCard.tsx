import Link from "next/link";
import { type ReactNode } from "react";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="glass min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-[var(--foreground)] hover:opacity-80 transition-opacity"
        aria-label="Retour à l'accueil {{APP_NAME}}"
      >
        <span
          className="inline-block w-9 h-9 rounded-full"
          style={{ background: "var(--gradient-aurora)", boxShadow: "var(--shadow-glow)" }}
          aria-hidden="true"
        />
        <span className="font-semibold text-2xl tracking-tight">{{APP_NAME}}</span>
      </Link>

      <section className="glass w-full max-w-md rounded-[var(--radius-lg)] p-8 sm:p-10">
        <header className="mb-6">
          <h1 className="font-semibold text-3xl text-[var(--foreground)] mb-2 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--muted)] leading-relaxed">{subtitle}</p>}
        </header>
        {children}
      </section>

      {footer && <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>}

      <p className="mt-10 max-w-md text-center text-xs text-[var(--muted)] leading-relaxed">
        {{APP_NAME}} ne remplace pas un avis médical professionnel. En cas de détresse,
        appelle le 3114 (suicide écoute) ou le 15 (SAMU).
      </p>
    </main>
  );
}
