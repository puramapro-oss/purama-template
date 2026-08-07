'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'
import { formatPrice } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'

export default function AbonnementPage() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single()
          if (profile) {
            setPlan(profile.plan || 'free')
          }
        }
      } catch {
        // silent — loading state already shown
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [])

  const handleManageSubscription = async () => {
    try {
      setSubscribing('portal')
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      }
    } catch {
      setSubscribing(null)
    }
  }

  const handleSubscribe = async (planKey: string) => {
    try {
      setSubscribing(planKey)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      }
    } catch {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl h-48 animate-pulse" />
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl h-48 animate-pulse" />
      </div>
    )
  }

  const plans = [
    { key: 'monthly', ...PLANS.MONTHLY },
    { key: 'yearly', ...PLANS.YEARLY },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5FA]">Abonnement</h1>
        <p className="mt-1 text-[#F5F5FA]/60">
          Gérez votre abonnement et vos préférences de facturation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((planData) => {
          const isCurrentPlan = plan === planData.key
          const isMostPopular = planData.key === 'yearly'

          return (
            <div
              key={planData.key}
              className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 relative ${
                isCurrentPlan
                  ? 'border-[#7C3AED] shadow-[0_0_60px_rgba(124,58,237,0.3)]'
                  : 'border-white/[0.06]'
              }`}
            >
              {isMostPopular && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#F5F5FA]">
                    {planData.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#F5F5FA]">
                      {formatPrice(planData.price)}
                    </span>
                    <span className="text-[#F5F5FA]/60">
                      /{planData.key === 'yearly' ? 'an' : 'mois'}
                    </span>
                  </div>
                  {planData.key === 'yearly' && (
                    <p className="mt-1 text-sm text-green-400">
                      Économisez 2 mois
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#F5F5FA]/80">
                    <Check className="w-4 h-4 text-[#7C3AED]" />
                    Essai gratuit de 7 jours
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#F5F5FA]/80">
                    <Check className="w-4 h-4 text-[#7C3AED]" />
                    Annulation à tout moment
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#F5F5FA]/80">
                    <Check className="w-4 h-4 text-[#7C3AED]" />
                    Support prioritaire
                  </div>
                </div>

                {isCurrentPlan ? (
                  <div className="pt-4">
                    <button
                      onClick={handleManageSubscription}
                      disabled={subscribing === 'portal'}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] text-[#F5F5FA] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {subscribing === 'portal'
                        ? 'Chargement...'
                        : 'Gérer l&apos;abonnement'}
                    </button>
                  </div>
                ) : (
                  <div className="pt-4">
                    <button
                      onClick={() => handleSubscribe(planData.key)}
                      disabled={subscribing === planData.key}
                      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {subscribing === planData.key
                        ? 'Chargement...'
                        : 'S&apos;abonner'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
