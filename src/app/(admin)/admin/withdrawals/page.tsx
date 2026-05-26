import { createServiceClient } from '@/lib/supabase-server'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminWithdrawalsPage() {
  const supabase = createServiceClient()

  const { data: withdrawals, error } = await supabase
    .from('wallet_entries')
    .select('id, user_id, amount_cents, description, created_at, status')
    .eq('type', 'withdraw')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

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
            Retraits en attente ({withdrawals?.length || 0})
          </h2>
        </div>
        {withdrawals && withdrawals.length > 0 ? (
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
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#F5F5FA]/60 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {withdrawals.map((withdrawal: any) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#F5F5FA]/60">
                      {withdrawal.user_id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400">
                      {formatPrice(withdrawal.amount_cents)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#F5F5FA]/60">
                      {withdrawal.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F5F5FA]/60">
                      {formatDate(withdrawal.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[#F5F5FA]/60">Aucun retrait en attente</p>
          </div>
        )}
      </div>
    </div>
  )
}
