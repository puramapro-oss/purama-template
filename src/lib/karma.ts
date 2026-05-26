/**
 * KARMA split 50/10/40
 * 50% users pool | 10% asso | 40% SASU
 * Resolution §9.1 — 2026-04-15
 */

export interface KarmaSplit {
  users: number   // cents → users reward pool
  asso: number    // cents → ASSO PURAMA
  sasu: number    // cents → SASU PURAMA
  total: number   // cents → original amount
}

export function splitRevenue(amountCents: number): KarmaSplit {
  const users = Math.floor(amountCents * 0.5)
  const asso = Math.floor(amountCents * 0.1)
  const sasu = amountCents - users - asso // remainder avoids rounding loss

  return { users, asso, sasu, total: amountCents }
}

export interface ReferralCommission {
  n1: number // cents — 50% of first payment
}

export function calcReferralCommission(firstPaymentCents: number): ReferralCommission {
  return {
    n1: Math.floor(firstPaymentCents * 0.5),
  }
}

export function formatKarma(split: KarmaSplit): string {
  const fmt = (c: number) => (c / 100).toFixed(2) + '€'
  return `Users: ${fmt(split.users)} | Asso: ${fmt(split.asso)} | SASU: ${fmt(split.sasu)}`
}
