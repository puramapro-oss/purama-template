'use client'

import {
  CheckCircle2,
  Lock,
  Star,
  Users,
  Zap,
  Compass,
  Award,
} from 'lucide-react'

const achievements = [
  {
    id: 1,
    icon: Star,
    title: 'Premier pas',
    description: 'Créer son compte',
    unlocked: true,
  },
  {
    id: 2,
    icon: Users,
    title: 'Parrainage',
    description: 'Inviter 1 ami',
    unlocked: false,
  },
  {
    id: 3,
    icon: Award,
    title: 'Fidèle',
    description: '7 jours consécutifs',
    unlocked: false,
  },
  {
    id: 4,
    icon: Zap,
    title: 'Ambassadeur',
    description: '5 parrainages',
    unlocked: false,
  },
  {
    id: 5,
    icon: CheckCircle2,
    title: 'Pro',
    description: 'S\'abonner au plan Pro',
    unlocked: false,
  },
  {
    id: 6,
    icon: Compass,
    title: 'Explorateur',
    description: 'Utiliser 3 fonctionnalités',
    unlocked: false,
  },
]

export default function AchievementsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5FA]">Succès</h1>
        <p className="mt-1 text-[#F5F5FA]/60">
          Débloquez des récompenses en utilisant l'application
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon

          return (
            <div
              key={achievement.id}
              className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                achievement.unlocked
                  ? 'border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.2)]'
                  : 'border-white/[0.06] opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]'
                      : 'bg-white/5'
                  }`}
                >
                  {achievement.unlocked ? (
                    <Icon className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-[#F5F5FA]/40" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[#F5F5FA]">
                    {achievement.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#F5F5FA]/60">
                    {achievement.description}
                  </p>

                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">
                        Débloqué
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
