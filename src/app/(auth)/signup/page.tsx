'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError('Erreur lors de l\'inscription. Vérifiez vos informations.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
              <h1 className="text-2xl font-bold">Vérifiez votre email</h1>
              <p className="text-white/60 text-sm">
                Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien pour activer votre compte.
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Créer un compte</h1>
            <p className="text-white/60 text-sm">Commencez avec {'{{APP_NAME}}'}</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom complet</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mot de passe</label>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-xl py-3 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              S&apos;inscrire
            </button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0A0A0F] px-3 text-xs text-white/40">ou continuer avec</span></div>
          </div>
          <button
            onClick={handleGoogle}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/[0.08] transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <p className="text-sm text-center text-white/60">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-[#7C3AED] hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
