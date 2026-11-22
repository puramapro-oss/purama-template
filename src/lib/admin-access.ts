import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

/** Evaluate only an identity verified by auth.getUser(), never profile metadata. */
export function isAdminIdentity(user: { email?: string | null } | null | undefined): boolean {
  return user?.email === SUPER_ADMIN_EMAIL
}
