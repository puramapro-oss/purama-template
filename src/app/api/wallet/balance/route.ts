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
      .select('wallet_balance_cents, wallet_pending_cents')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      balance: profile.wallet_balance_cents ?? 0,
      pending: profile.wallet_pending_cents ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
