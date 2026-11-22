import assert from 'node:assert/strict'
import { test } from 'node:test'
import { React, dom, createRoot, loadTypeScript } from './support/auth-dom.mjs'

let root, container, calls

function show(file, authOverrides = {}) {
  const router = { push: value => calls.pushes.push(value), refresh: () => { calls.refreshes++ } }
  const auth = {}
  for (const method of ['signInWithPassword', 'signInWithOAuth', 'signUp', 'resetPasswordForEmail', 'updateUser']) {
    auth[method] = async (...args) => {
      calls[method].push(args)
      return authOverrides[method] ? authOverrides[method](...args) : { data: { session: null }, error: null }
    }
  }
  const { default: Page } = loadTypeScript(`src/app/(auth)/${file}/page.tsx`, {
    '@/lib/supabase': { createClient: () => ({ auth }) },
    'next/navigation': { useRouter: () => router, useSearchParams: () => new URLSearchParams(window.location.search) },
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  })
  React.act(() => root.render(React.createElement(Page)))
}
function enter(selector, value) {
  const input = container.querySelector(selector)
  assert.ok(input, `Missing input ${selector}`)
  enterInput(input, value)
}
function enterInput(input, value) {
  React.act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
function fill() {
  if (container.querySelector('input[type=text]')) enter('input[type=text]', 'Synthetic Person')
  if (container.querySelector('input[type=email]')) enter('input[type=email]', 'submitted@example.test')
  for (const input of container.querySelectorAll('input[type=password]')) enterInput(input, 'Synthetic Password 123')
}
function submitEvent() { container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) }
function googleButton() {
  const button = [...container.querySelectorAll('button')].find(item => item.textContent.includes('Continuer avec Google'))
  assert.ok(button, 'Google action must be present')
  return button
}
const nextTurn = () => new Promise(resolve => setImmediate(resolve))
async function submit() { await React.act(async () => { submitEvent(); await nextTurn() }) }
function deferred() { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
async function check(name, body) {
  await test(name, async t => {
    dom.reconfigure({ url: 'https://template.purama.test/login' })
    container = document.createElement('div'); document.body.append(container); root = createRoot(container)
    calls = { pushes: [], refreshes: 0, signInWithPassword: [], signInWithOAuth: [], signUp: [], resetPasswordForEmail: [], updateUser: [] }
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
const forms = [
  ['login', 'signInWithPassword'], ['signup', 'signUp'], ['forgot-password', 'resetPasswordForEmail'], ['reset-password', 'updateUser'],
]
for (const [page, method] of forms) {
  await check(`${page}: SDK rejection permits a successful retry`, async observed => {
    let attempt = 0
    show(page, { [method]: async () => {
      if (++attempt === 1) throw new Error('synthetic transport failure')
      return { data: { session: null }, error: null }
    } }); fill(); await submit()
    observed.disabled = container.querySelector('button[type=submit]')?.disabled
    observed.alert = container.querySelector('[role=alert]')?.textContent ?? null
    assert.equal(observed.disabled, false, 'submit must be enabled after SDK rejection')
    assert.ok(observed.alert, 'a recoverable error must be visible')
    assert.ok(!container.textContent.includes('synthetic transport failure'))
    await submit()
    observed.retryRequests = calls[method].length
    assert.equal(observed.retryRequests, 2)
    if (page === 'login' || page === 'reset-password') assert.deepEqual(calls.pushes, ['/dashboard'])
    else assert.equal(container.querySelector('strong')?.textContent, 'submitted@example.test')
  })
}
for (const [page, method] of forms) {
  await check(`${page}: same-tick submits issue one request`, async observed => {
    const gate = deferred(); show(page, { [method]: () => gate.promise }); fill()
    await React.act(async () => { submitEvent(); submitEvent() })
    observed.requests = calls[method].length
    await React.act(async () => gate.resolve({ data: { session: null }, error: { message: 'synthetic rejected input' } }))
    assert.equal(observed.requests, 1, 'a pending form must prevent duplicate side effects')
  })
}
for (const page of ['login', 'signup']) {
  await check(`${page}: Google provider error is visible`, async observed => {
    show(page, { signInWithOAuth: async () => ({ error: { message: 'synthetic provider failure' } }) })
    const button = [...container.querySelectorAll('button')].find(item => item.textContent.includes('Continuer avec Google'))
    await React.act(async () => { button.click(); await nextTurn() })
    observed.requests = calls.signInWithOAuth.length
    observed.alert = container.querySelector('[role=alert]')?.textContent ?? null
    assert.equal(observed.requests, 1)
    assert.ok(observed.alert, 'provider error must be visible')
    assert.ok(!container.textContent.includes('synthetic provider failure'))
    assert.equal(button.disabled, false)
  })
}
for (const [page, method] of forms.filter(([page]) => ['signup', 'forgot-password'].includes(page))) {
  await check(`${page}: confirmation identifies the submitted email`, async observed => {
    const gate = deferred(); show(page, { [method]: () => gate.promise }); fill()
    await React.act(async () => submitEvent())
    enter('input[type=email]', 'edited@example.test')
    await React.act(async () => gate.resolve({ data: { session: null }, error: null }))
    observed.confirmedEmail = container.querySelector('strong')?.textContent ?? null
    observed.submittedEmail = page === 'signup' ? calls[method][0][0].email : calls[method][0][0]
    assert.equal(observed.confirmedEmail, observed.submittedEmail)
  })
}
await check('login: an unmounted form cannot navigate on stale completion', async observed => {
  const gate = deferred(); show('login', { signInWithPassword: () => gate.promise }); fill()
  await React.act(async () => submitEvent())
  React.act(() => root.render(React.createElement('main', null, 'Another route')))
  await React.act(async () => gate.resolve({ data: { session: { synthetic: true } }, error: null }))
  observed.pushes = [...calls.pushes]; observed.refreshes = calls.refreshes
  assert.deepEqual(observed.pushes, [])
  assert.equal(observed.refreshes, 0)
})
await check('signup: an active session proceeds to the dashboard', async observed => {
  show('signup', { signUp: async () => ({ data: { session: { synthetic: true } }, error: null }) }); fill(); await submit()
  observed.pushes = [...calls.pushes]
  observed.heading = container.querySelector('h1')?.textContent ?? null
  assert.deepEqual(observed.pushes, ['/dashboard'])
  assert.ok(!container.textContent.includes('Vérifiez votre email'))
})

for (const [page, method] of forms) {
  await check(`${page}: a returned SDK error permits a successful retry`, async observed => {
    let attempt = 0
    show(page, { [method]: async () => ++attempt === 1
      ? { error: { message: 'synthetic private SDK detail' } }
      : { data: { session: null }, error: null } })
    fill(); await submit()
    observed.alert = container.querySelector('[role=alert]')?.textContent ?? null
    assert.ok(observed.alert)
    assert.ok(!container.textContent.includes('synthetic private SDK detail'))
    assert.equal(container.querySelector('button[type=submit]').disabled, false)
    await submit()
    observed.requests = calls[method].length
    assert.equal(observed.requests, 2)
    if (page === 'login' || page === 'reset-password') assert.deepEqual(calls.pushes, ['/dashboard'])
    else assert.equal(container.querySelector('strong')?.textContent, 'submitted@example.test')
  })
}
for (const page of ['login', 'signup']) {
  await check(`${page}: Google rejection permits another attempt`, async observed => {
    let attempt = 0
    show(page, { signInWithOAuth: async () => {
      if (++attempt === 1) throw new Error('synthetic private OAuth exception')
      return { error: null }
    } })
    await React.act(async () => { googleButton().click(); await nextTurn() })
    observed.alert = container.querySelector('[role=alert]')?.textContent ?? null
    assert.ok(observed.alert)
    assert.equal(googleButton().disabled, false)
    assert.ok(!container.textContent.includes('synthetic private OAuth exception'))
    await React.act(async () => { googleButton().click(); await nextTurn() })
    observed.requests = calls.signInWithOAuth.length
    assert.equal(observed.requests, 2)
  })
  await check(`${page}: double Google click issues one request`, async observed => {
    const gate = deferred(); show(page, { signInWithOAuth: () => gate.promise })
    await React.act(async () => { googleButton().click(); googleButton().click() })
    observed.requests = calls.signInWithOAuth.length
    await React.act(async () => gate.resolve({ error: { message: 'synthetic provider error' } }))
    assert.equal(observed.requests, 1)
  })
  for (const first of ['password', 'google']) {
    await check(`${page}: ${first} excludes a simultaneous other auth action`, async observed => {
      const gate = deferred(); const method = page === 'login' ? 'signInWithPassword' : 'signUp'
      show(page, { [method]: () => gate.promise, signInWithOAuth: () => gate.promise }); fill()
      await React.act(async () => {
        if (first === 'password') { submitEvent(); googleButton().click() }
        else { googleButton().click(); submitEvent() }
      })
      observed.passwordRequests = calls[method].length; observed.oauthRequests = calls.signInWithOAuth.length
      await React.act(async () => gate.resolve({ error: { message: 'synthetic auth error' } }))
      assert.equal(observed.passwordRequests, first === 'password' ? 1 : 0)
      assert.equal(observed.oauthRequests, first === 'google' ? 1 : 0)
    })
  }
}
for (const [page, method] of forms.filter(([page]) => page !== 'login')) {
  await check(`${page}: completion after unmount does not affect the next route`, async observed => {
    const gate = deferred(); show(page, { [method]: () => gate.promise }); fill()
    await React.act(async () => submitEvent())
    React.act(() => root.render(React.createElement('main', null, 'Another route')))
    await React.act(async () => gate.resolve({ data: { session: { synthetic: true } }, error: null }))
    observed.pushes = [...calls.pushes]; observed.refreshes = calls.refreshes; observed.content = container.textContent
    assert.deepEqual(observed.pushes, []); assert.equal(observed.refreshes, 0)
    assert.equal(observed.content, 'Another route')
  })
}
for (const [page, method] of forms) {
  await check(`${page}: a remounted form accepts a new request independently`, async observed => {
    const oldRequest = deferred(); show(page, { [method]: () => oldRequest.promise }); fill()
    await React.act(async () => submitEvent())
    React.act(() => root.render(React.createElement('main', null, 'Another route')))
    const newRequest = deferred(); show(page, { [method]: () => newRequest.promise }); fill()
    await React.act(async () => submitEvent())
    await React.act(async () => oldRequest.resolve({ data: { session: { synthetic: true } }, error: null }))
    observed.pendingAfterOldCompletion = container.querySelector('button[type=submit]')?.disabled
    observed.pushesAfterOldCompletion = [...calls.pushes]
    assert.equal(observed.pendingAfterOldCompletion, true)
    assert.deepEqual(observed.pushesAfterOldCompletion, [])
    await React.act(async () => newRequest.resolve({ data: { session: null }, error: null }))
    observed.requests = calls[method].length
    assert.equal(observed.requests, 2)
    if (page === 'login' || page === 'reset-password') assert.deepEqual(calls.pushes, ['/dashboard'])
    else assert.equal(container.querySelector('strong')?.textContent, 'submitted@example.test')
  })
}
for (const [page, method] of forms.filter(([page]) => ['login', 'reset-password'].includes(page))) {
  await check(`${page}: completion retains the submit lock until navigation`, async observed => {
    show(page); fill(); await submit(); await submit()
    observed.requests = calls[method].length; observed.pushes = [...calls.pushes]
    assert.equal(observed.requests, 1); assert.deepEqual(observed.pushes, ['/dashboard'])
  })
}
for (const [password, confirmation] of [['short', 'short'], ['Synthetic Password 123', 'Different Password 123']]) {
  await check(`reset-password: invalid ${password === confirmation ? 'length' : 'confirmation'} does not call the SDK`, async observed => {
    show('reset-password')
    const inputs = container.querySelectorAll('input[type=password]')
    enterInput(inputs[0], password); enterInput(inputs[1], confirmation); await submit()
    observed.requests = calls.updateUser.length
    assert.equal(observed.requests, 0)
    assert.ok(container.querySelector('[role=alert]')?.textContent)
    assert.equal(container.querySelector('button[type=submit]').disabled, false)
    fill(); await submit(); assert.equal(calls.updateUser.length, 1)
  })
}
