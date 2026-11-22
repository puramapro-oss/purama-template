'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuthSubmission } from '@/hooks/useAuthSubmission'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { loading, begin, isActive, finish } = useAuthSubmission()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!begin()) return
    setError('')
    const submittedEmail = email.trim()
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(submittedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
      })
      if (!isActive()) return
      if (error) {
        setError('Erreur lors de l\'envoi du lien. Vérifiez l\'email et réessayez.')
        return
      }
      setConfirmationEmail(submittedEmail)
      setSuccess(true)
    } catch {
      if (isActive()) setError('L\'envoi du lien est momentanément indisponible. Réessayez.')
    } finally {
      finish()
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Email envoyé</h1>
              <p className="text-white/60 text-sm">
                Un lien de réinitialisation a été envoyé à <strong>{confirmationEmail}</strong>. Vérifiez votre boîte de réception.
              </p>
            </div>
            <Link href="/login" className="inline-block text-sm text-[#7C3AED] hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>
    )
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
            <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
            <p className="text-white/60 text-sm">Entrez votre email pour réinitialiser votre mot de passe</p>
          </div>
          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="text-sm font-medium">Email</label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-xl py-3 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer le lien
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
