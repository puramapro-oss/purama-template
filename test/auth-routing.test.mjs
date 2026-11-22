import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NextRequest } from 'next/server.js'
import { loadTypeScript } from './support/load-typescript.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const origin = 'https://template.purama.test'
const callbackPath = 'src/app/(auth)/callback/route.ts'
const { SUPER_ADMIN_EMAIL } = loadTypeScript('src/lib/constants.ts')

function callback({ exchangeError = null, exchangeThrows = false, factoryThrows = false } = {}, routePath = callbackPath) {
  const calls = []
  const { GET } = loadTypeScript(routePath, {
    '@/lib/supabase-server': { createClient: async () => {
      if (factoryThrows) throw new Error('private backend detail')
      return { auth: { exchangeCodeForSession: async code => {
        calls.push(code)
        if (exchangeThrows) throw new Error('private backend detail')
        return { data: { session: null }, error: exchangeError }
      } } }
    } },
  })
  return { GET, calls }
}

function requestFor(next, extra = {}) {
  const url = new URL('/callback', origin)
  url.searchParams.set('code', 'synthetic-auth-code')
  if (next !== undefined) url.searchParams.set('next', next)
  for (const [key, value] of Object.entries(extra)) {
    if (value === null) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  return new Request(url)
}

for (const target of ['/dashboard', '/dashboard/wallet?view=pending#balance', '/reset-password', '/dossiers/été?q=clé']) {
  test(`callback preserves an internal destination: ${target}`, async () => {
    const { GET, calls } = callback()
    const response = await GET(requestFor(target))
    assert.equal(response.status, 307)
    assert.equal(response.headers.get('location'), new URL(target, origin).href)
    assert.deepEqual(calls, ['synthetic-auth-code'])
  })
}

const unsafeDestinations = [
  '@outside.invalid', '@outside.invalid/path', 'https://outside.invalid', '//outside.invalid',
  '/\\outside.invalid', '\\outside.invalid', 'javascript:alert(1)', 'data:text/html,example',
  'dashboard', '', '///outside.invalid', '/one/..//outside.invalid',
  '/%5coutside.invalid', '/%2foutside.invalid', '/%0aoutside.invalid',
  '/%252foutside.invalid', '/%255coutside.invalid', '/%250doutside.invalid',
  '/bad\npath', '/bad\tpath', '/bad\u0000path',
]
for (const target of unsafeDestinations) {
  test(`callback rejects an unsafe destination: ${JSON.stringify(target)}`, async () => {
    const { GET } = callback()
    const response = await GET(requestFor(target))
    assert.equal(response.headers.get('location'), `${origin}/dashboard`)
  })
}

test('callback uses the default destination when next is missing', async () => {
  const { GET } = callback()
  assert.equal((await GET(requestFor())).headers.get('location'), `${origin}/dashboard`)
})

for (const scenario of [
  { name: 'missing code', extra: { code: null }, expectedCalls: 0 },
  { name: 'provider denial', extra: { error: 'access_denied', error_description: 'private detail' }, expectedCalls: 0 },
  { name: 'provider error code without error text', extra: { error_code: 'otp_expired' }, expectedCalls: 0 },
  { name: 'exchange error', options: { exchangeError: { message: 'private detail' } }, expectedCalls: 1 },
  { name: 'exchange exception', options: { exchangeThrows: true }, expectedCalls: 1 },
  { name: 'client initialization exception', options: { factoryThrows: true }, expectedCalls: 0 },
]) {
  test(`callback returns a recoverable login response for ${scenario.name}`, async () => {
    const { GET, calls } = callback(scenario.options)
    const response = await GET(requestFor('/dashboard/wallet?view=pending', scenario.extra))
    const location = new URL(response.headers.get('location'))
    assert.equal(location.origin, origin)
    assert.equal(location.pathname, '/login')
    assert.equal(location.searchParams.get('error'), 'auth_callback_failed')
    assert.equal(location.searchParams.get('next'), '/dashboard/wallet?view=pending')
    assert.ok(!location.href.includes('private'))
    assert.ok(!location.href.includes('synthetic-auth-code'))
    assert.equal(calls.length, scenario.expectedCalls)
  })
}

test('the OAuth URL used by the forms resolves to the same callback implementation', async () => {
  const alias = 'src/app/auth/callback/route.ts'
  assert.ok(fs.existsSync(path.join(__dirname, '..', alias)), 'the existing /auth/callback contract must be routable')
  const { GET, calls } = callback({}, alias)
  const response = await GET(new Request(`${origin}/auth/callback?code=alias-code&next=%2Freset-password`))
  assert.equal(response.headers.get('location'), `${origin}/reset-password`)
  assert.deepEqual(calls, ['alias-code'])
})

function middleware({ user = null, superAdmin = false, refreshCookies = false, refreshBatches = [] } = {}) {
  let calls = 0
  const { middleware: run } = loadTypeScript('src/middleware.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => {
      calls++
      return {
        auth: { getUser: async () => {
          if (refreshCookies) options.cookies.setAll([{ name: 'session-test', value: 'renewed', options: { httpOnly: true, secure: true, path: '/' } }])
          for (const batch of refreshBatches) options.cookies.setAll(batch.cookies, batch.headers)
          return { data: { user } }
        } },
        from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { is_super_admin: superAdmin } }) }) }) }),
      }
    } },
  })
  return { run, getCalls: () => calls }
}

for (const publicPath of ['/callback?code=example', '/auth/callback?code=example', '/forgot-password', '/reset-password', '/cgu', '/cgv', '/mentions-legales', '/login', '/pricing']) {
  test(`middleware admits the public route without consulting auth: ${publicPath}`, async () => {
    const { run, getCalls } = middleware()
    const response = await run(new NextRequest(`${origin}${publicPath}`))
    assert.equal(response.status, 200)
    assert.equal(getCalls(), 0)
  })
}

for (const privatePath of ['/dashboard?filter=active', '/callback/private', '/auth/private', '/admin', '/admin/users']) {
  test(`middleware still protects ${privatePath}`, async () => {
    const { run, getCalls } = middleware()
    const response = await run(new NextRequest(`${origin}${privatePath}`))
    const destination = new URL(response.headers.get('location'))
    assert.equal(response.status, 307)
    assert.equal(destination.pathname, '/login')
    assert.equal(destination.searchParams.get('next'), privatePath)
    assert.equal(getCalls(), 1)
  })
}

test('middleware keeps refreshed cookies on a login redirect', async () => {
  const { run } = middleware({ refreshCookies: true })
  const response = await run(new NextRequest(`${origin}/dashboard`))
  assert.match(response.headers.get('set-cookie') ?? '', /session-test=renewed/)
})

test('middleware keeps refreshed cookies when a non-admin is redirected', async () => {
  const { run } = middleware({ user: { id: 'synthetic-user' }, refreshCookies: true })
  const response = await run(new NextRequest(`${origin}/admin/users`))
  assert.equal(response.headers.get('location'), `${origin}/dashboard`)
  assert.match(response.headers.get('set-cookie') ?? '', /session-test=renewed/)
})

test('middleware continues authenticated admin requests', async () => {
  const { run } = middleware({ user: { id: 'synthetic-user', email: SUPER_ADMIN_EMAIL } })
  assert.equal((await run(new NextRequest(`${origin}/admin/users`))).status, 200)
})

test('middleware forwards refreshed session cookies to the same server render', async () => {
  const { run } = middleware({ user: { id: 'synthetic-user' }, refreshCookies: true })
  const request = new NextRequest(`${origin}/dashboard`, { headers: { cookie: 'session-test=expired; preference=light' } })
  const response = await run(request)
  assert.equal(response.status, 200)
  assert.equal(request.cookies.get('session-test')?.value, 'renewed')
  assert.equal(response.headers.get('x-middleware-request-cookie'), 'session-test=renewed; preference=light')
  assert.equal(response.cookies.get('session-test')?.value, 'renewed')
  assert.match(response.headers.get('cache-control') ?? '', /private/)
  assert.match(response.headers.get('cache-control') ?? '', /no-store/)
})

const sdkCacheHeaders = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
  Expires: '0',
  Pragma: 'no-cache',
}

for (const scenario of [
  { name: 'authenticated render', path: '/dashboard', user: { id: 'synthetic-user' }, status: 200 },
  { name: 'login redirect', path: '/dashboard', user: null, status: 307 },
  { name: 'admin rejection redirect', path: '/admin/users', user: { id: 'synthetic-user' }, status: 307 },
]) {
  test(`middleware propagates Supabase session cache headers on an ${scenario.name}`, async () => {
    const { run } = middleware({
      user: scenario.user,
      refreshBatches: [{
        cookies: [{ name: 'session-test', value: 'renewed', options: { path: '/', secure: true, httpOnly: true, sameSite: 'lax' } }],
        headers: sdkCacheHeaders,
      }],
    })
    const response = await run(new NextRequest(`${origin}${scenario.path}`))
    assert.equal(response.status, scenario.status)
    for (const [name, value] of Object.entries(sdkCacheHeaders)) assert.equal(response.headers.get(name), value)
    assert.deepEqual(response.cookies.get('session-test'), {
      name: 'session-test', value: 'renewed', path: '/', secure: true, httpOnly: true, sameSite: 'lax',
    })
  })
}

for (const redirect of [false, true]) {
  test(`middleware preserves multiple cookie batches and their options${redirect ? ' through a redirect' : ''}`, async () => {
    const expiry = new Date('2040-01-02T03:04:05.000Z')
    const firstCookie = { name: 'session-test.0', value: 'first-part', options: { path: '/', httpOnly: true, secure: true, sameSite: 'lax', expires: expiry } }
    const removedCookie = { name: 'session-test.2', value: '', options: { path: '/', httpOnly: true, secure: true, maxAge: 0 } }
    const lastCookie = { name: 'session-test.1', value: 'second-part', options: { path: '/', httpOnly: true, secure: true, sameSite: 'strict' } }
    const { run } = middleware({
      user: redirect ? null : { id: 'synthetic-user' },
      refreshBatches: [
        { cookies: [firstCookie, removedCookie], headers: sdkCacheHeaders },
        { cookies: [lastCookie] },
        { cookies: [], headers: { 'X-Auth-Refresh': 'complete' } },
      ],
    })
    const response = await run(new NextRequest(`${origin}/dashboard`, { headers: { cookie: 'session-test.2=old-part; preference=light' } }))
    assert.equal(response.status, redirect ? 307 : 200)
    assert.equal(response.cookies.getAll().length, 3)
    assert.deepEqual(response.cookies.get(firstCookie.name), { name: firstCookie.name, value: firstCookie.value, ...firstCookie.options })
    assert.deepEqual(response.cookies.get(lastCookie.name), { name: lastCookie.name, value: lastCookie.value, ...lastCookie.options })
    assert.equal(response.cookies.get(removedCookie.name)?.maxAge, 0)
    assert.equal(response.cookies.get(removedCookie.name)?.value, '')
    assert.equal(response.cookies.get(removedCookie.name)?.httpOnly, true)
    assert.equal(response.cookies.get(removedCookie.name)?.secure, true)
    assert.equal(response.headers.get('expires'), '0')
    assert.equal(response.headers.get('pragma'), 'no-cache')
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
    assert.equal(response.headers.get('x-auth-refresh'), 'complete')
    if (!redirect) {
      const forwarded = response.headers.get('x-middleware-request-cookie') ?? ''
      assert.match(forwarded, /session-test\.0=first-part/)
      assert.match(forwarded, /session-test\.1=second-part/)
      assert.match(forwarded, /preference=light/)
      assert.ok(!forwarded.includes('old-part'))
    }
  })
}

for (const fails of [false, true]) {
  test(`callback disables shared caching on ${fails ? 'failure' : 'success'}`, async () => {
    const { GET } = callback({ exchangeError: fails ? { message: 'private detail' } : null })
    const response = await GET(requestFor('/dashboard'))
    assert.match(response.headers.get('cache-control') ?? '', /private/)
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
  })
}
