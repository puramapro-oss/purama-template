'use client'
import { useEffect, useState } from 'react'

interface WalletState {
  balance_cents: number
  balance_eur: number
  entries: WalletEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface WalletEntry {
  id: string
  amount: number
  type: string
  description: string
  status: string
  created_at: string
}

export function useWallet(): WalletState {
  const [balance_cents, setBalanceCents] = useState(0)
  const [balance_eur, setBalanceEur] = useState(0)
  const [entries, setEntries] = useState<WalletEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setBalanceCents(data.balance_cents)
        setBalanceEur(data.balance_eur)
        setEntries(data.entries)
        setError(null)
      })
      .catch(() => setError('Impossible de charger le solde'))
      .finally(() => setLoading(false))
  }, [tick])

  return { balance_cents, balance_eur, entries, loading, error, refetch: () => setTick(t => t + 1) }
}
