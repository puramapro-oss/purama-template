import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server.js'
import { renderToStaticMarkup } from 'react-dom/server'
import { loadTypeScript } from './support/load-typescript.mjs'

const origin = 'https://template.purama.test'
const { SUPER_ADMIN_EMAIL } = loadTypeScript('src/lib/constants.ts')
const owner = { id: '11111111-1111-4111-8111-111111111111', email: SUPER_ADMIN_EMAIL }
const other = {
  id: '22222222-2222-4222-8222-222222222222', email: 'other@example.test',
  super_admin: true, is_super_admin: true,
  user_metadata: { email: SUPER_ADMIN_EMAIL, role: 'super_admin', super_admin: true, is_super_admin: true },
}
const cacheHeaders = { 'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0', Expires: '0', Pragma: 'no-cache' }
const cookie = { name: 'session-test', value: 'renewed', options: { path: '/', httpOnly: true, secure: true, sameSite: 'lax' } }
const cases = [
  { name: 'existing admin without a profile flag', user: owner, allowed: true },
  { name: 'other user with forged flags and metadata', user: other, deniedAt: '/dashboard' },
  { name: 'authenticated user without an email', user: { id: other.id }, deniedAt: '/dashboard' },
  { name: 'missing identity', user: null, deniedAt: '/login' },
  { name: 'verification error despite an owner-shaped user', user: owner, authError: { message: 'synthetic private verification detail' }, deniedAt: '/login' },
  { name: 'getUser exception', user: owner, authThrows: true, deniedAt: '/login' },
  { name: 'client initialization exception', user: owner, factoryThrows: true, deniedAt: '/login' },
]

class Redirect extends Error {
  constructor(destination) { super('Synthetic Next redirect'); this.destination = destination }
}

function query(result) {
  const chain = { then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) }
  for (const method of ['select', 'eq', 'order', 'limit', 'update', 'single']) chain[method] = () => chain
  return chain
}

function fixture(scenario) {
  const calls = { getUser: 0, profileReads: 0, serviceClients: 0, privilegedQueries: [] }
  const createClient = options => {
    if (scenario.factoryThrows) throw new Error('synthetic private initialization detail')
    return {
      auth: { getUser: async () => {
        calls.getUser++
        if (options?.cookies) options.cookies.setAll([cookie], cacheHeaders)
        if (scenario.authThrows) throw new Error('synthetic private transport detail')
        return { data: { user: scenario.user }, error: scenario.authError ?? null }
      } },
      from: () => {
        calls.profileReads++
        // The historical profile contract is deliberately untrustworthy. Neither
        // an absent owner flag nor another user's flags may decide HTTP access.
        return query(scenario.user?.email === SUPER_ADMIN_EMAIL
          ? { data: null, error: { message: 'column is_super_admin does not exist' } }
          : { data: { email: SUPER_ADMIN_EMAIL, super_admin: true, is_super_admin: true }, error: null })
      },
    }
  }
  const mocks = {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => createClient(options) },
    '@/lib/supabase-server': {
      createClient: async () => createClient(),
      createServiceClient: () => {
        calls.serviceClients++
        return { from: table => {
          calls.privilegedQueries.push(table)
          return query({ data: [], error: null })
        } }
      },
    },
    'next/navigation': { redirect: destination => { throw new Redirect(destination) } },
  }
  return { calls, mocks }
}

// The legacy public override must grant no rights, and must not remove the
// existing identity's rights. Each test restores the process environment.
async function withUntrustedOverride(body) {
  const previous = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL = other.email
  try { await body() } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL
    else process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL = previous
  }
}

for (const scenario of cases) {
  test(`middleware admin access: ${scenario.name}`, async () => withUntrustedOverride(async () => {
    const { calls, mocks } = fixture(scenario)
    const { middleware } = loadTypeScript('src/middleware.ts', mocks)
    const response = await middleware(new NextRequest(`${origin}/admin/users?sort=recent`, { headers: { cookie: 'session-test=expired' } }))
    assert.equal(response.status, scenario.allowed ? 200 : 307)
    if (scenario.allowed) {
      assert.equal(response.headers.get('location'), null)
      assert.equal(response.headers.get('x-middleware-request-cookie'), 'session-test=renewed')
    } else {
      const destination = new URL(response.headers.get('location'))
      assert.equal(destination.pathname, scenario.deniedAt)
      if (scenario.deniedAt === '/login') assert.equal(destination.searchParams.get('next'), '/admin/users?sort=recent')
    }
    assert.equal(calls.profileReads, 0)
    assert.equal(calls.serviceClients, 0)
    assert.match(response.headers.get('cache-control') ?? '', /private/)
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
    if (!scenario.factoryThrows) {
      assert.deepEqual(response.cookies.get(cookie.name), { name: cookie.name, value: cookie.value, ...cookie.options })
      for (const [name, value] of Object.entries(cacheHeaders)) assert.equal(response.headers.get(name), value)
    }
  }))
}

const views = [
  { name: 'layout', path: 'src/app/(admin)/layout.tsx', title: /Admin — God Mode/, privileged: false },
  { name: 'users page', path: 'src/app/(admin)/admin/users/page.tsx', title: /Utilisateurs/, privileged: true },
  { name: 'payments page', path: 'src/app/(admin)/admin/payments/page.tsx', title: /Paiements/, privileged: true },
  { name: 'withdrawals page', path: 'src/app/(admin)/admin/withdrawals/page.tsx', title: /Retraits en attente/, privileged: true },
]
for (const view of views) {
  for (const scenario of cases) {
    test(`${view.name} admin access: ${scenario.name}`, async () => withUntrustedOverride(async () => {
      const { calls, mocks } = fixture(scenario)
      const { default: Page } = loadTypeScript(view.path, mocks)
      const render = async () => renderToStaticMarkup(await Page({ children: null }))
      if (scenario.allowed) {
        assert.match(await render(), view.title)
        assert.equal(calls.serviceClients, view.privileged ? 1 : 0)
        assert.equal(calls.privilegedQueries.length, view.privileged ? 1 : 0)
      } else {
        await assert.rejects(render, error => error instanceof Redirect && error.destination === scenario.deniedAt)
        assert.equal(calls.serviceClients, 0)
        assert.deepEqual(calls.privilegedQueries, [])
      }
      assert.equal(calls.getUser, scenario.factoryThrows ? 0 : 1)
      assert.equal(calls.profileReads, 0)
    }))
  }
}

const endpoints = [
  { name: 'GET users', path: 'src/app/api/admin/users/route.ts', method: 'GET', url: '/api/admin/users' },
  { name: 'GET withdrawals', path: 'src/app/api/admin/withdrawals/route.ts', method: 'GET', url: '/api/admin/withdrawals' },
  { name: 'POST withdrawals', path: 'src/app/api/admin/withdrawals/route.ts', method: 'POST', url: '/api/admin/withdrawals' },
]
for (const endpoint of endpoints) {
  for (const scenario of cases) {
    test(`${endpoint.name} admin access: ${scenario.name}`, async () => withUntrustedOverride(async () => {
      const { calls, mocks } = fixture(scenario)
      const handler = loadTypeScript(endpoint.path, mocks)[endpoint.method]
      const request = new NextRequest(`${origin}${endpoint.url}`, endpoint.method === 'POST'
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: owner.id, status: 'approved' }) }
        : undefined)
      const response = await handler(request)
      assert.equal(response.status, scenario.allowed ? 200 : 403)
      assert.equal(calls.serviceClients, scenario.allowed ? 1 : 0)
      assert.equal(calls.privilegedQueries.length, scenario.allowed ? 1 : 0)
      assert.equal(calls.getUser, scenario.factoryThrows ? 0 : 1)
      assert.equal(calls.profileReads, 0)
      if (endpoint.method === 'POST') assert.equal(request.bodyUsed, Boolean(scenario.allowed), 'body parsing must follow authorization')
      assert.match(response.headers.get('cache-control') ?? '', /private/)
      assert.match(response.headers.get('cache-control') ?? '', /no-store/)
      const body = await response.json()
      if (!scenario.allowed) assert.equal(body.error, 'Accès interdit')
      assert.ok(!JSON.stringify(body).includes('synthetic private'))
    }))
  }
}
