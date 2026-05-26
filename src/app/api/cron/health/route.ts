import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req)
  if (authResult) return authResult

  try {
    const supabase = createServiceClient()

    const { data: dbCheck } = await supabase.from('profiles').select('id').limit(1)

    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeSubscriptions } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: userCount ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        dbConnection: dbCheck ? 'ok' : 'error',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la vérification de santé' }, { status: 500 })
  }
}
