import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-6xl font-bold gradient-text">404</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Page introuvable</h1>
        <p className="mt-2 text-sm text-[rgba(245,245,250,0.5)]">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}
