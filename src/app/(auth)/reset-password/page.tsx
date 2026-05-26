'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Erreur lors de la réinitialisation. Vérifiez le lien et réessayez.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
            <p className="text-white/60 text-sm">Créez un nouveau mot de passe pour votre compte</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
              <p className="text-xs text-white/40">Au moins 8 caractères</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-xl py-3 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
