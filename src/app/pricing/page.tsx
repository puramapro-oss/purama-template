import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tarifs',
}

const PLANS = [
  {
    name: 'Mensuel',
    price: '9,99€',
    period: '/mois',
    desc: '7 jours d\'essai gratuit',
    priceId: 'MONTHLY',
    highlight: false,
    features: ['IA illimitée', 'Wallet & cashback', 'Parrainage', 'Support email'],
  },
  {
    name: 'Annuel',
    price: '79,99€',
    period: '/an',
    desc: '2 mois offerts — économisez 40%',
    priceId: 'YEARLY',
    highlight: true,
    features: ['IA illimitée', 'Wallet & cashback', 'Parrainage', 'Support prioritaire', 'Accès fonctionnalités beta'],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-dvh py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Tarifs simples,{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              sans surprise
            </span>
          </h1>
          <p className="text-[rgba(245,245,250,0.6)]">7 jours d'essai gratuit — aucune carte bancaire requise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.priceId}
              className={`relative rounded-2xl p-6 space-y-6 backdrop-blur-xl ${
                plan.highlight
                  ? 'bg-[rgba(255,255,255,0.05)] border border-[var(--primary)]/40 shadow-[0_0_60px_color-mix(in_srgb,var(--primary)_30%,transparent)]'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)]'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap text-white">
                  Recommandé
                </span>
              )}
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">{plan.name}</p>
                <p className="text-sm text-[var(--secondary)]">{plan.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--foreground)]">{plan.price}</span>
                <span className="text-[rgba(245,245,250,0.6)]">{plan.period}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[rgba(245,245,250,0.8)]">
                    <Check className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 text-white'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.08)] text-[var(--foreground)]'
                }`}
              >
                <Zap className="w-4 h-4" />
                Commencer l'essai gratuit
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[rgba(245,245,250,0.4)]">
          En vous abonnant, vous acceptez nos <Link href="/cgu" className="text-[var(--primary)] hover:underline">CGU</Link> et{' '}
          <Link href="/cgv" className="text-[var(--primary)] hover:underline">CGV</Link>.
          Résiliation possible à tout moment.
        </p>
      </div>
    </div>
  )
}
