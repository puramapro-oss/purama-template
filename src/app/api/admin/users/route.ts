import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()
    const { data: profiles, error } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, email, subscription_status, created_at, wallet_balance_cents')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
