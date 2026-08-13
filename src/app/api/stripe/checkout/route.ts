import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import { stripe, PLANS } from '@/lib/stripe'

const schema = z.object({ plan: z.enum(['MONTHLY', 'YEARLY']) })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { plan } = schema.parse(body)

    const serviceSupabase = createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('stripe_customer_id, full_name, referral_code')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.full_name ?? undefined,
        metadata: { user_id: user.id, slug: '{{SLUG}}' },
      })
      customerId = customer.id
      await serviceSupabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const selectedPlan = PLANS[plan]
    if (!selectedPlan.priceId) {
      return NextResponse.json({ error: 'Ce plan n\'est pas encore configuré pour le paiement. Réessaie plus tard ou contacte le support.' }, { status: 503 })
    }
    const origin = req.headers.get('origin') ?? 'https://{{SLUG}}.purama.dev'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { app_slug: '{{SLUG}}' }
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/settings/abonnement?checkout=cancel`,
      metadata: { user_id: user.id, slug: '{{SLUG}}', app_slug: '{{SLUG}}' },
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
