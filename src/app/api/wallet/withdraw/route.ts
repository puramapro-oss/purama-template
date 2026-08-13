import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import { WALLET_MIN_WITHDRAWAL } from '@/lib/constants'

const schema = z.object({
  amount_cents: z.number().int().positive(),
  iban: z.string().min(15).max(34),
  bic: z.string().min(8).max(11),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { amount_cents, iban, bic } = schema.parse(body)

    if (amount_cents < WALLET_MIN_WITHDRAWAL * 100) {
      return NextResponse.json({ error: `Montant minimum: ${WALLET_MIN_WITHDRAWAL}€` }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('wallet_balance_cents, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    if ((profile.wallet_balance_cents ?? 0) < amount_cents) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
    }

    const { data: withdrawal, error: withdrawalError } = await serviceSupabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount_cents,
        iban,
        bic,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Erreur lors de la demande de retrait' }, { status: 500 })
    }

    // Verrou optimiste anti-course (2 retraits quasi-simultanés, cf task_plan.md P3) :
    // n'écrit QUE si wallet_balance_cents n'a pas bougé depuis la lecture. Sinon la
    // demande de retrait déjà créée ci-dessus est annulée (pas de retrait fantôme).
    const { data: debited } = await serviceSupabase
      .from('profiles')
      .update({ wallet_balance_cents: profile.wallet_balance_cents - amount_cents })
      .eq('id', user.id)
      .eq('wallet_balance_cents', profile.wallet_balance_cents)
      .select('id')
      .maybeSingle()

    if (!debited) {
      await serviceSupabase.from('withdrawals').delete().eq('id', withdrawal.id)
      return NextResponse.json({ error: 'Le solde a changé entre-temps. Réessaie.' }, { status: 409 })
    }

    return NextResponse.json({ success: true, message: 'Demande de retrait enregistrée' })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
