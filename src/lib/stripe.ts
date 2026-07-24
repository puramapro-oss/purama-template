import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_build_placeholder', {
  apiVersion: '2025-08-27.basil',
})

export const PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Mensuel',
    price: 999, // cents
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? '',
  },
  YEARLY: {
    id: 'yearly',
    name: 'Annuel',
    price: 7999, // cents
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_YEARLY ?? '',
  },
} as const

export type PlanId = keyof typeof PLANS

export async function createCheckoutSession({
  userId,
  email,
  planId,
  referralCode,
  successUrl,
  cancelUrl,
}: {
  userId: string
  email: string
  planId: PlanId
  referralCode?: string
  successUrl: string
  cancelUrl: string
}) {
  const plan = PLANS[planId]

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planId,
      referralCode: referralCode ?? '',
      app_slug: '{{SLUG}}',
    },
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId,
        planId,
        referralCode: referralCode ?? '',
        app_slug: '{{SLUG}}',
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
