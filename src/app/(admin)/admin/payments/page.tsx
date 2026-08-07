import { createServiceClient } from '@/lib/supabase-server'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminPaymentsPage() {
  const supabase = createServiceClient()

  const { data: entries, error } = await supabase
    .from('wallet_entries')
    .select('id, user_id, amount_cents, type, description, created_at')
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
            Paiements ({entries?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {entries?.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#F5F5FA]/60">
                    {entry.user_id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#F5F5FA]">
                    {formatPrice(entry.amount_cents)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.type === 'credit'
                          ? 'bg-green-500/20 text-green-400'
                          : entry.type === 'withdraw'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#06B6D4]/20 text-[#06B6D4]'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#F5F5FA]/60">
                    {entry.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F5F5FA]/60">
                    {formatDate(entry.created_at)}
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
