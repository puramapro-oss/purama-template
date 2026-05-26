import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req)
  if (authResult) return authResult

  try {
    const supabase = createServiceClient()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: accountsToDelete } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('deletion_requested', true)

    if (!accountsToDelete || accountsToDelete.length === 0) {
      return NextResponse.json({ message: 'Aucun compte à supprimer', deleted: 0 })
    }

    const deletedIds: string[] = []

    for (const account of accountsToDelete) {
      const { error } = await supabase.auth.admin.deleteUser(account.id)
      if (!error) {
        deletedIds.push(account.id)
      }
    }

    return NextResponse.json({
      message: `${deletedIds.length} comptes supprimés`,
      deleted: deletedIds.length,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression des comptes' }, { status: 500 })
  }
}
