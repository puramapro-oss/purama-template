const DEFAULT_DESTINATION = '/dashboard'
const VALIDATION_ORIGIN = 'https://auth-redirect.invalid'

function isUnsafePath(path: string): boolean {
  return !path.startsWith('/') || path.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(path)
}

/** Accept a local path, never an authority, protocol or encoded path separator. */
export function safeAuthRedirectPath(value: string | null | undefined): string {
  if (!value || isUnsafePath(value)) return DEFAULT_DESTINATION

  try {
    const destination = new URL(value, VALIDATION_ORIGIN)
    if (destination.origin !== VALIDATION_ORIGIN) return DEFAULT_DESTINATION

    let path = destination.pathname
    // Check normalized and decoded paths as routers can decode a segment later.
    // Bound the work and reject deeper encoding instead of trusting it.
    for (let depth = 0; depth < 4; depth++) {
      if (isUnsafePath(path)) return DEFAULT_DESTINATION
      const normalized = new URL(path, VALIDATION_ORIGIN)
      if (normalized.origin !== VALIDATION_ORIGIN || isUnsafePath(normalized.pathname)) {
        return DEFAULT_DESTINATION
      }
      const decoded = decodeURIComponent(path)
      if (decoded === path) {
        return `${destination.pathname}${destination.search}${destination.hash}`
      }
      path = decoded
    }
  } catch {
    // Invalid encoding or URL input is untrusted; the dashboard remains reachable.
    return DEFAULT_DESTINATION
  }

  return DEFAULT_DESTINATION
}
