import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { splitRevenue, calcReferralCommission } from '@/lib/karma'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  // Verify internal secret from karma dispatcher
  const internalSecret = req.headers.get('x-internal-secret')
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.text()
  const sig = req.headers.get('x-stripe-signature')!

  // Defense in depth: still verify Stripe signature even though karma already did
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        if (!userId || session.mode !== 'subscription') break

        await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', userId)

        const amountCents = session.amount_total ?? 0
        const split = splitRevenue(amountCents)

        await supabase.from('wallet_entries').insert({
          user_id: userId,
          amount_cents: amountCents,
          type: 'subscription',
          status: 'completed',
          description: `Abonnement — split KARMA ${JSON.stringify(split)}`,
        })

        const { data: profile } = await supabase
          .from('profiles')
          .select('referred_by')
          .eq('id', userId)
          .single()

        if (profile?.referred_by) {
          const commission = calcReferralCommission(amountCents)
          await supabase.from('referrals').insert({
            referrer_id: profile.referred_by,
            referred_id: userId,
            amount_cents: commission.n1,
            status: 'pending',
          })
          await supabase
            .from('profiles')
            .update({ wallet_balance_cents: commission.n1 })
            .eq('id', profile.referred_by)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('profiles').update({ subscription_status: status }).eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('profiles').update({ subscription_status: 'canceled' }).eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement du webhook' }, { status: 500 })
  }
}
