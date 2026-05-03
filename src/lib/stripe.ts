/**
 * {{APP_NAME}} — Stripe gateway (mock-aware)
 * ============================================================================
 * Pricing par défaut Purama (override via STRIPE_PRICE_* en prod) :
 *   - Standard : 9.99€/mois
 *   - Premium  : 19.99€/mois
 *
 * Essai gratuit 14 jours. Rétractation art. L221-28 3° (waiver implicite par
 * clic, ZÉRO checkbox). Annulation à tout moment via Customer Portal Stripe.
 *
 * Mode mock :
 *   - MOCK_STRIPE_CONNECT=true OU pas de STRIPE_SECRET_KEY → checkout renvoie
 *     une URL fake `?mock_session=...`, webhook accepte JSON brut sans signature.
 *   - sinon → vraie API Stripe live.
 *
 * Personnalise `PLANS.perks` après bootstrap selon les features de l'app.
 */
import Stripe from "stripe";

export type PlanCode = "standard" | "premium";

export interface PlanDef {
  code: PlanCode;
  label: string;
  priceCents: number;
  currency: "eur";
  trialDays: number;
  /** stripe Price ID en prod, null en mock. */
  stripePriceId: string | null;
  perks: string[];
}

export const PLANS: Record<PlanCode, PlanDef> = {
  standard: {
    code: "standard",
    label: "Standard",
    priceCents: 999,
    currency: "eur",
    trialDays: 14,
    stripePriceId: process.env.STRIPE_PRICE_STANDARD ?? null,
    perks: [
      "Accès complet aux features de base",
      "Support communautaire",
      // TODO: remplir selon le BRIEF de l'app
    ],
  },
  premium: {
    code: "premium",
    label: "Premium",
    priceCents: 1999,
    currency: "eur",
    trialDays: 14,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? null,
    perks: [
      "Tout le Standard sans limites",
      "Accès prioritaire aux nouveautés",
      "Support prioritaire",
      // TODO: remplir selon le BRIEF de l'app
    ],
  },
};

export function isStripeMocked(): boolean {
  if (process.env.MOCK_STRIPE_CONNECT === "true") return true;
  if (!process.env.STRIPE_SECRET_KEY) return true;
  return false;
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "[stripe] STRIPE_SECRET_KEY manquante — switch en MOCK_STRIPE_CONNECT=true ou renseigne la clé."
    );
  }
  stripeClient = new Stripe(key, { typescript: true });
  return stripeClient;
}

/**
 * Crée une checkout session Stripe (mode subscription) ou un mock session.
 * Renvoie l'URL où rediriger le client.
 */
export async function createCheckoutSession(opts: {
  userId: string;
  email: string;
  plan: PlanCode;
  successUrl: string;
  cancelUrl: string;
  referralCode?: string;
}): Promise<{ url: string; sessionId: string; mocked: boolean }> {
  const plan = PLANS[opts.plan];
  if (!plan) throw new Error(`Plan inconnu : ${opts.plan}`);

  if (isStripeMocked()) {
    const fakeSessionId = `cs_mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const url = `${opts.successUrl}${opts.successUrl.includes("?") ? "&" : "?"}mock_session=${fakeSessionId}&plan=${plan.code}`;
    return { url, sessionId: fakeSessionId, mocked: true };
  }

  if (!plan.stripePriceId) {
    throw new Error(
      `[stripe] STRIPE_PRICE_${plan.code.toUpperCase()} manquante en mode prod — renseigne le price ID.`
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: opts.email,
    client_reference_id: opts.userId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: plan.trialDays,
      metadata: {
        userId: opts.userId,
        plan: plan.code,
        referralCode: opts.referralCode ?? "",
      },
    },
    metadata: {
      userId: opts.userId,
      plan: plan.code,
      referralCode: opts.referralCode ?? "",
    },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  });

  return {
    url: session.url ?? opts.cancelUrl,
    sessionId: session.id,
    mocked: false,
  };
}

/**
 * Crée un Customer Portal session (gestion abonnement par l'utilisateur).
 */
export async function createPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string; mocked: boolean }> {
  if (isStripeMocked()) {
    return { url: opts.returnUrl, mocked: true };
  }
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });
  return { url: session.url, mocked: false };
}
