import { createClient } from '@/lib/supabase-server'
import { safeAuthRedirectPath } from '@/lib/auth-redirect'
import { NextResponse } from 'next/server'

function redirectWithoutCache(destination: URL) {
  const response = NextResponse.redirect(destination)
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Expires', '0')
  response.headers.set('Pragma', 'no-cache')
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeAuthRedirectPath(searchParams.get('next'))
  const failure = new URL('/login', origin)
  failure.searchParams.set('error', 'auth_callback_failed')
  failure.searchParams.set('next', next)

  if (!code || searchParams.has('error') || searchParams.has('error_code')) return redirectWithoutCache(failure)

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return redirectWithoutCache(failure)
  } catch {
    return redirectWithoutCache(failure)
  }

  return redirectWithoutCache(new URL(next, origin))
}
