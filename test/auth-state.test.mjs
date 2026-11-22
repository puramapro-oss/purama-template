import assert from 'node:assert/strict'
import { test } from 'node:test'
import { React, createRoot, loadTypeScript } from './support/auth-dom.mjs'

// This reusable hook currently has Header.tsx as its only consumer; Header
// is not imported by a route/layout in this snapshot. These are unit tests.
let container, root

const nextTurn = () => new Promise(resolve => setImmediate(resolve))
const flush = () => React.act(async () => { await nextTurn() })
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
function state() { return { user: container.querySelector('[data-user]')?.textContent ?? null, loading: container.querySelector('[data-loading]')?.textContent ?? null } }
function mount({ getUser, factoryThrows = false, strict = false } = {}) {
  const record = { subscriptions: [], getUser: 0 }
  const auth = {
    getUser: async () => { record.getUser++; return getUser ? getUser(record) : { data: { user: null }, error: null } },
    onAuthStateChange: callback => {
      const subscription = { callback, unsubscriptions: 0 }
      record.subscriptions.push(subscription)
      return { data: { subscription: { unsubscribe: () => { subscription.unsubscriptions++ } } } }
    },
  }
  const { useAuth } = loadTypeScript('src/hooks/useAuth.ts', { '@/lib/supabase': { createClient: () => {
    if (factoryThrows) throw new Error('synthetic private initialization detail')
    return { auth }
  } } })
  function Probe() {
    const { user, loading } = useAuth()
    return React.createElement('main', null,
      React.createElement('output', { 'data-user': true }, user?.id ?? 'none'),
      React.createElement('output', { 'data-loading': true }, String(loading)))
  }
  React.act(() => root.render(strict ? React.createElement(React.StrictMode, null, React.createElement(Probe)) : React.createElement(Probe)))
  return record
}
async function check(name, body) {
  await test(name, async t => {
    container = document.createElement('div'); document.body.append(container); root = createRoot(container)
    const observed = {}
    try {
      await body(observed)
    } catch (error) {
      t.diagnostic(JSON.stringify(observed))
      throw error
    } finally {
      React.act(() => root.unmount()); container.remove(); await nextTurn()
    }
  })
}
await check('rejected initial getUser clears loading without an unhandled rejection', async observed => {
  mount({ getUser: async () => { throw new Error('synthetic private transport detail') } }); await flush()
  Object.assign(observed, state());
  assert.deepEqual(state(), { user: 'none', loading: 'false' })
})
await check('client initialization failure clears loading without crashing the component', async observed => {
  mount({ factoryThrows: true }); await flush(); Object.assign(observed, state())
  assert.deepEqual(state(), { user: 'none', loading: 'false' })
})
await check('an auth event occurring during initial getUser is observed', async observed => {
  const record = mount({ getUser: async record => {
    for (const item of record.subscriptions) item.callback('SIGNED_IN', { user: { id: 'new-session' } })
    return { data: { user: { id: 'old-read' } }, error: null }
  } })
  await flush(); Object.assign(observed, state()); observed.subscriptions = record.subscriptions.length
  assert.deepEqual(state(), { user: 'new-session', loading: 'false' })
})
await check('a delayed initial read cannot overwrite a newer auth event', async observed => {
  const gate = deferred(); const record = mount({ getUser: () => gate.promise })
  React.act(() => record.subscriptions[0].callback('SIGNED_IN', { user: { id: 'new-session' } }))
  await React.act(async () => gate.resolve({ data: { user: { id: 'old-read' } }, error: null }))
  Object.assign(observed, state()); assert.deepEqual(state(), { user: 'new-session', loading: 'false' })
})
await check('a newer signed-out event settles loading despite a pending or rejected initial read', async observed => {
  const gate = deferred(); const record = mount({ getUser: () => gate.promise })
  React.act(() => record.subscriptions[0].callback('SIGNED_OUT', null))
  observed.beforeRejection = state()
  await React.act(async () => { gate.reject(new Error('synthetic stale transport detail')); await nextTurn() })
  observed.afterRejection = state()
  assert.deepEqual(observed.beforeRejection, { user: 'none', loading: 'false' })
  assert.deepEqual(observed.afterRejection, { user: 'none', loading: 'false' })
})
await check('StrictMode cleanup isolates old reads and callbacks from a fresh effect', async observed => {
  const oldRead = deferred(); const newRead = deferred()
  const record = mount({ strict: true, getUser: record => record.getUser === 1 ? oldRead.promise : newRead.promise })
  assert.equal(record.subscriptions.length, 2)
  assert.equal(record.subscriptions[0].unsubscriptions, 1)
  await React.act(async () => newRead.resolve({ data: { user: { id: 'current-read' } }, error: null }))
  assert.deepEqual(state(), { user: 'current-read', loading: 'false' })
  await React.act(async () => oldRead.resolve({ data: { user: { id: 'retired-read' } }, error: null }))
  observed.afterOldRead = state()
  React.act(() => record.subscriptions[0].callback('SIGNED_OUT', null))
  observed.afterRetiredCallback = state()
  React.act(() => record.subscriptions[1].callback('SIGNED_IN', { user: { id: 'fresh-event' } }))
  observed.afterCurrentCallback = state()
  assert.deepEqual(observed.afterOldRead, { user: 'current-read', loading: 'false' })
  assert.deepEqual(observed.afterRetiredCallback, { user: 'current-read', loading: 'false' })
  assert.deepEqual(observed.afterCurrentCallback, { user: 'fresh-event', loading: 'false' })
  React.act(() => root.render(React.createElement('main', null, 'Another route')))
  observed.unsubscriptions = record.subscriptions.map(item => item.unsubscriptions)
  assert.deepEqual(observed.unsubscriptions, [1, 1])
  React.act(() => record.subscriptions[1].callback('SIGNED_OUT', null))
  assert.equal(container.textContent, 'Another route')
})
