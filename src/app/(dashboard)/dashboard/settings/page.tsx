'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, CreditCard, LogOut, Moon, Sun, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const supabase = createClient()

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      window.location.href = '/login'
    } catch (err) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
    toast.success(`Thème ${next === 'dark' ? 'sombre' : 'clair'} activé`)
  }

  const items = [
    { label: 'Profil', icon: User, href: '/dashboard/profile' },
    { label: 'Abonnement', icon: CreditCard, href: '/dashboard/settings/abonnement' },
  ]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="space-y-4">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-4 bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:bg-white/[0.08] transition"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-white/60" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:bg-white/[0.08] transition"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-white/60" /> : <Sun className="w-5 h-5 text-white/60" />}
              <span className="font-medium">Thème {theme === 'dark' ? 'sombre' : 'clair'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Déconnexion</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
