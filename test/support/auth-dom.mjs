import { createRequire } from 'node:module'
import { loadTypeScript } from './load-typescript.mjs'

// This optional test runtime was qualified with jsdom 29.0.2, React/ReactDOM
// 19.2.4 and Node 24.22.3. jsdom is not added to the product dependency lock.
// Install it in the test environment or point JSDOM_MODULE_PATH at its package.
const requireFromRepo = createRequire(new URL('../../package.json', import.meta.url))
let JSDOM
try {
  ;({ JSDOM } = requireFromRepo(process.env.JSDOM_MODULE_PATH || 'jsdom'))
} catch (cause) {
  throw new Error('Auth DOM tests require jsdom. Provide JSDOM_MODULE_PATH or install jsdom in the test environment (qualified: 29.0.2).', { cause })
}

export const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://template.purama.test/login' })
for (const name of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent']) {
  Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
export const React = requireFromRepo('react')
export const { createRoot } = requireFromRepo('react-dom/client')
export { loadTypeScript }
