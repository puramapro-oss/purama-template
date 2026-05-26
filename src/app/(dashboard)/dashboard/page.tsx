import { createClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-white/60">Bienvenue sur {'{{APP_NAME}}'}, {user?.user_metadata?.full_name || user?.email}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-medium text-white/60">Utilisateurs actifs</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-medium text-white/60">Messages envoyés</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-medium text-white/60">Gains totaux</h3>
          <p className="text-2xl font-bold">0,00 €</p>
        </div>
      </div>
    </div>
  )
}
