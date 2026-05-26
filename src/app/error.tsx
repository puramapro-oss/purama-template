'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error boundary:', error)
  }, [error])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <div className="glass flex max-w-md flex-col items-center gap-6 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--destructive)]/10">
          <svg className="h-8 w-8 text-[var(--destructive)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Une erreur est survenue</h2>
          <p className="mt-2 text-sm text-[rgba(245,245,250,0.5)]">
            Nous sommes désolés. Veuillez réessayer.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Réessayer
        </button>
      </div>
    </main>
  )
}
