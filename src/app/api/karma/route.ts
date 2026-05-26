import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { splitRevenue } from '@/lib/karma'

const schema = z.object({ amount_cents: z.number().int().positive() })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { amount_cents } = schema.parse(body)
    return NextResponse.json(splitRevenue(amount_cents))
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
