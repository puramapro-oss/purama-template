import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const verified = verifyCronSecret(request)
  if (verified) return verified

  try {
    const supabase = createServiceClient()

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeSubscribers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('plan', 'free')

    const { data: walletData } = await supabase
      .from('wallet_entries')
      .select('amount_cents')
      .eq('type', 'credit')

    const totalWalletCents =
      walletData?.reduce((sum, entry) => sum + (entry.amount_cents || 0), 0) ||
      0

    return NextResponse.json({
      users: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      totalWalletCents,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
