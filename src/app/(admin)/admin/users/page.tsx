import { createServiceClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AdminUsersPage() {
  const supabase = createServiceClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at, plan, is_super_admin')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
          <p className="text-red-400">Erreur de chargement: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-semibold text-[#F5F5FA]">
            Utilisateurs ({profiles?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {profiles?.map((profile: Profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F5F5FA]">
                    {profile.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F5F5FA]">
                    {profile.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#7C3AED]/20 text-[#7C3AED]">
                      {profile.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F5F5FA]/60">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.is_super_admin && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#FFD700]/20 text-[#FFD700]">
                        Super Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
