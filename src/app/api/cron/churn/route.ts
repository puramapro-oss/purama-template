import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const verified = verifyCronSecret(request)
  if (verified) return verified

  try {
    const supabase = createServiceClient()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: churnCandidates } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('subscription_status', 'past_due')
      .lt('updated_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      processed: churnCandidates?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
