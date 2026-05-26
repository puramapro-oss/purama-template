'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Users, Wallet, Settings } from 'lucide-react'

const tabs = [
  { name: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Parrain', href: '/dashboard/referral', icon: Users },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Réglages', href: '/dashboard/settings', icon: Settings },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#14141C]/95 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map(tab => {
          const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${
                isActive ? 'text-[#7C3AED]' : 'text-white/60'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
