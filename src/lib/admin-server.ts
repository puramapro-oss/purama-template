import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdminIdentity } from '@/lib/admin-access'

type AdminAccess = 'allowed' | 'unauthenticated' | 'forbidden'

export async function getAdminAccess(): Promise<AdminAccess> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) return 'unauthenticated'
    return isAdminIdentity(data.user) ? 'allowed' : 'forbidden'
  } catch {
    return 'unauthenticated'
  }
}

/** Guard each server page before constructing a privileged database client. */
export async function requireAdminAccess() {
  const access = await getAdminAccess()
  if (access === 'unauthenticated') redirect('/login')
  if (access === 'forbidden') redirect('/dashboard')
}

export function adminJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}
