import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

const approveSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()
    const { data: withdrawals, error } = await serviceSupabase
      .from('withdrawals')
      .select('*, profiles(full_name, email)')
      .order('requested_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des retraits' }, { status: 500 })
    }

    return NextResponse.json({ withdrawals })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    const body = await req.json()
    const { id, status } = approveSchema.parse(body)

    const serviceSupabase = createServiceClient()
    const { error } = await serviceSupabase
      .from('withdrawals')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
