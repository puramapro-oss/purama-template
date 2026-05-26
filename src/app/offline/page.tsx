'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 rounded-2xl bg-white/5">
            <WifiOff className="w-16 h-16 text-[#F5F5FA]/40" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            {'{{APP_NAME}}'}
          </h1>
          <h2 className="text-xl font-semibold text-[#F5F5FA]">
            Vous êtes hors ligne
          </h2>
          <p className="text-[#F5F5FA]/60">
            Vérifiez votre connexion internet et réessayez.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white font-semibold transition-opacity"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
