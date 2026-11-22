import { createServiceClient } from '@/lib/supabase-server'
import { getAdminAccess, adminJson } from '@/lib/admin-server'

export async function GET() {
  try {
    if (await getAdminAccess() !== 'allowed') return adminJson({ error: 'Accès interdit' }, 403)

    const serviceSupabase = createServiceClient()
    const { data: profiles, error } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, email, subscription_status, created_at, wallet_balance_cents')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return adminJson({ error: 'Erreur lors de la récupération des utilisateurs' }, 500)
    }

    return adminJson({ users: profiles })
  } catch {
    return adminJson({ error: 'Erreur serveur' }, 500)
  }
}
