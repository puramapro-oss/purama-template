import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const serviceSupabase = createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (!profile?.referral_code) {
      return NextResponse.json({ error: 'Code de parrainage introuvable' }, { status: 404 })
    }

    const { count: totalReferrals } = await serviceSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', user.id)

    const { data: earnings } = await serviceSupabase
      .from('referrals')
      .select('amount_cents, status')
      .eq('referrer_id', user.id)

    const totalEarned = earnings?.reduce((sum, e) => sum + e.amount_cents, 0) ?? 0
    const pendingEarnings = earnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount_cents, 0) ?? 0

    return NextResponse.json({
      referralCode: profile.referral_code,
      referralLink: `https://{{SLUG}}.purama.dev/go/${profile.referral_code}`,
      totalReferrals: totalReferrals ?? 0,
      totalEarned,
      pendingEarnings,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
