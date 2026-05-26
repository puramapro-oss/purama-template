export interface User {
  id: string
  email: string
  role: 'user' | 'super_admin'
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  status: 'active' | 'trialing' | 'canceled' | 'past_due'
  planId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface ReferralStats {
  code: string
  clicks: number
  signups: number
  conversions: number
  totalEarned: number // cents
}
