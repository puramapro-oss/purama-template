'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { safeAuthRedirectPath } from '@/lib/auth-redirect'
import { useAuthSubmission } from '@/hooks/useAuthSubmission'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loading, begin, isActive, finish } = useAuthSubmission()
  const [error, setError] = useState<string | null>(null)
  const displayedError = error ?? (searchParams.get('error') === 'auth_callback_failed'
    ? 'Le lien de connexion a expiré ou la connexion a été interrompue. Réessayez.'
    : '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!begin()) return
    setError('')
    const next = safeAuthRedirectPath(searchParams.get('next'))
    let navigating = false
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (!isActive()) return
      if (error) {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
        return
      }
      router.push(next)
      router.refresh()
      navigating = true
    } catch {
      if (isActive()) setError('La connexion est momentanément indisponible. Réessayez.')
    } finally {
      if (!navigating) finish()
    }
  }

  async function handleGoogle() {
    if (!begin()) return
    setError('')
    let navigating = false
    try {
      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('next', safeAuthRedirectPath(searchParams.get('next')))
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.href },
      })
      if (!isActive()) return
      if (error) {
        setError('La connexion avec Google a échoué. Réessayez.')
        return
      }
      navigating = true
    } catch {
      if (isActive()) setError('La connexion avec Google est momentanément indisponible. Réessayez.')
    } finally {
      if (!navigating) finish()
    }
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
            <h1 className="text-2xl font-bold">Connexion</h1>
            <p className="text-white/60 text-sm">Bienvenue sur {'{{APP_NAME}}'}</p>
          </div>
          {displayedError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{displayedError}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="login-email" className="text-sm font-medium">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-[#7C3AED] hover:underline">Oublié ?</Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              Se connecter
            </button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0A0A0F] px-3 text-xs text-white/40">ou continuer avec</span></div>
          </div>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/[0.08] transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
          <p className="text-sm text-center text-white/60">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-[#7C3AED] hover:underline">S&apos;inscrire</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center" role="status">Chargement de la connexion…</main>}>
      <LoginForm />
    </Suspense>
  )
}
