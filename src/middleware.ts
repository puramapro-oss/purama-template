import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { isAdminIdentity } from '@/lib/admin-access'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths (no auth required)
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/callback',
    '/auth/callback',
    '/forgot-password',
    '/reset-password',
    '/mentions-legales',
    '/cgu',
    '/cgv',
    '/pricing',
    '/how-it-works',
    '/ecosystem',
    '/status',
    '/changelog',
    '/privacy',
    '/terms',
    '/aide',
    '/offline',
  ]

  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/legal/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/go/')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Create Supabase client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  const sessionHeaders = new Headers()

  function redirectWithCookies(url: URL) {
    const redirect = NextResponse.redirect(url)
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    sessionHeaders.forEach((value, name) => redirect.headers.set(name, value))
    if (!redirect.headers.has('Cache-Control')) redirect.headers.set('Cache-Control', 'private, no-store')
    return redirect
  }

  let user: User | null = null
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA!,
        },
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[], headersToSet: Record<string, string> = {}) {
            const previousCookies = response.cookies.getAll()
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            // NextResponse captures request headers when it is created. Rebuild after
            // refreshing the request cookies so the server render sees the new session.
            response = NextResponse.next({ request: { headers: request.headers } })
            for (const cookie of previousCookies) response.cookies.set(cookie)
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
            if (cookiesToSet.length > 0) sessionHeaders.set('Cache-Control', 'private, no-store')
            for (const [name, value] of Object.entries(headersToSet)) sessionHeaders.set(name, value)
            sessionHeaders.forEach((value, name) => response.headers.set(name, value))
          },
        },
      }
    )
    const { data, error } = await supabase.auth.getUser()
    user = error ? null : data.user
  } catch {
    // An unverifiable identity must never reach an administrative handler.
    user = null
  }

  // Protected routes → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return redirectWithCookies(loginUrl)
  }

  // Use the same established identity as the server layout, pages and APIs.
  if (pathname.startsWith('/admin') && !isAdminIdentity(user)) {
    return redirectWithCookies(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
