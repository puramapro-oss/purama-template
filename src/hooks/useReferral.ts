'use client'
import { useEffect, useState } from 'react'

interface ReferralState {
  referral_code: string | null
  referral_url: string
  referrals: Array<{ referred_id: string; commission_paid: boolean; created_at: string }>
  total_commission_cents: number
  loading: boolean
  error: string | null
}

export function useReferral(): ReferralState {
  const [state, setState] = useState<ReferralState>({
    referral_code: null,
    referral_url: '',
    referrals: [],
    total_commission_cents: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setState(s => ({ ...s, error: data.error, loading: false })); return }
        setState({ ...data, loading: false, error: null })
      })
      .catch(() => setState(s => ({ ...s, error: 'Erreur de chargement', loading: false })))
  }, [])

  return state
}
