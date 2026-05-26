import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{APP_NAME}}',
}

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-[0_0_60px_color-mix(in_srgb,var(--primary)_30%,transparent)]">
          <span className="text-2xl font-bold text-white">P</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{'{{APP_NAME}}'}</h1>
          <p className="mt-1 text-sm text-[rgba(245,245,250,0.5)]">{'{{APP_DESCRIPTION}}'}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/signup"
          className="flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
        >
          Commencer gratuitement
        </Link>
        <Link
          href="/login"
          className="flex h-11 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.98]"
        >
          Se connecter
        </Link>
      </div>

      {/* Footer links */}
      <div className="mt-8 flex gap-4 text-xs text-[rgba(245,245,250,0.3)]">
        <Link href="/pricing" className="hover:text-[rgba(245,245,250,0.6)]">Tarifs</Link>
        <Link href="/privacy" className="hover:text-[rgba(245,245,250,0.6)]">Confidentialité</Link>
        <Link href="/terms" className="hover:text-[rgba(245,245,250,0.6)]">CGU</Link>
      </div>
    </main>
  )
}
