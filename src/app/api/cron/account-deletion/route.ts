import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req)
  if (authResult) return authResult

  try {
    const supabase = createServiceClient()

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('deletion_requested', true)
      .lte('deletion_requested_at', thirtyDaysAgo)

    if (error) {
      return NextResponse.json({ error: 'Impossible de vérifier les demandes de suppression' }, { status: 500 })
    }

    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
      return NextResponse.json({ error: 'Comptage des demandes de suppression indisponible' }, { status: 503 })
    }

    if (count === 0) {
      return NextResponse.json({ message: 'Aucune demande de suppression arrivée à échéance', deleted: 0 })
    }

    // auth.users is shared across PURAMA apps. A local profile flag does not
    // authorize deleting that global identity or its data in other apps.
    // Keep requests intact until the coordinated deletion service is qualified.
    return NextResponse.json({
      error: 'La suppression du compte unifié nécessite le service central de suppression',
      code: 'GLOBAL_ACCOUNT_DELETION_UNAVAILABLE',
      pending: count,
      deleted: 0,
    }, { status: 503 })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression des comptes' }, { status: 500 })
  }
}
