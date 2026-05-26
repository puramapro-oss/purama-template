'use client'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getGreeting, getInitials } from '@/lib/utils'

export default function Header() {
  const { user } = useAuth()
  const initials = getInitials(user?.email ?? '?')

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6">
      <p className="text-sm text-white/60">{getGreeting()}</p>
      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition"
          aria-label="Rechercher"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  )
}
