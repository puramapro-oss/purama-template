export const SUPER_ADMIN_EMAIL = 'matiss.frasne@gmail.com'

export const WALLET_MIN_WITHDRAWAL = 5 // €

export const COMPANY_INFO = {
  name: 'SASU PURAMA',
  address: '8 Rue de la Chapelle',
  postalCode: '25560',
  city: 'Frasne',
  country: 'France',
  siret: '___À_REMPLIR___',
  tva: 'TVA non applicable art. 293B CGI',
  email: 'hello@purama.dev',
}

export const STRIPE_PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['Fonctionnalités de base', 'Support communautaire'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 1999, // 19.99€
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    features: ['Toutes les fonctionnalités', 'Support prioritaire', 'Accès anticipé'],
  },
}
