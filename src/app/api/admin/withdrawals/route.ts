import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'
import { getAdminAccess, adminJson } from '@/lib/admin-server'

const approveSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
})

export async function GET() {
  try {
    if (await getAdminAccess() !== 'allowed') return adminJson({ error: 'Accès interdit' }, 403)

    const serviceSupabase = createServiceClient()
    const { data: withdrawals, error } = await serviceSupabase
      .from('withdrawals')
      .select('*, profiles(full_name, email)')
      .order('requested_at', { ascending: false })
      .limit(100)

    if (error) {
      return adminJson({ error: 'Erreur lors de la récupération des retraits' }, 500)
    }

    return adminJson({ withdrawals })
  } catch {
    return adminJson({ error: 'Erreur serveur' }, 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    if (await getAdminAccess() !== 'allowed') return adminJson({ error: 'Accès interdit' }, 403)

    const body = await req.json()
    const { id, status } = approveSchema.parse(body)

    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase
      .from('withdrawals')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return adminJson({ error: 'Erreur lors de la mise à jour' }, 500)
    }

    return adminJson({ success: true })
  } catch (e) {
    if (e instanceof z.ZodError) return adminJson({ error: 'Paramètres invalides' }, 400)
    return adminJson({ error: 'Erreur serveur' }, 500)
  }
}
