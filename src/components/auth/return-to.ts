'use client'

import {
  CURRENT_APP,
  isSafeRelativePath,
  parseReturnTo,
} from '@robosystems/core'
import { useCallback, useEffect, useState } from 'react'

/**
 * Where the user goes after authenticating on the login home.
 *
 * `local` — a path on this app (this app's own AuthGuard, or a
 * `robosystems:/path` return_to). `app` — another product app, reached
 * via the SSO bridge.
 */
export type AuthDestination =
  | { kind: 'local'; path: string }
  | { kind: 'app'; app: string; path: string | null }

/**
 * Interpret a raw `?return_to=` value on the login home. Two producers,
 * two shapes: this app's own AuthGuard sends a bare local path
 * (`/graphs/abc`), while product-app redirectors and backend email links
 * send the app-qualified grammar (`roboledger` or `roboledger:/reports/x`).
 * Anything else — unknown apps, unsafe paths, absolute URLs — is
 * discarded; a login surface must never become an open redirect.
 */
export function parseDestination(
  raw: string | null | undefined
): AuthDestination | null {
  if (!raw) {
    return null
  }
  if (raw.startsWith('/')) {
    return isSafeRelativePath(raw) ? { kind: 'local', path: raw } : null
  }
  const parsed = parseReturnTo(raw)
  if (!parsed) {
    return null
  }
  // parseReturnTo already degrades unsafe paths to null; re-validate here so
  // the guarantee at this redirect sink doesn't rest on package internals.
  const path =
    parsed.path && isSafeRelativePath(parsed.path) ? parsed.path : null
  if (parsed.app === CURRENT_APP) {
    return path ? { kind: 'local', path } : null
  }
  return { kind: 'app', app: parsed.app, path }
}

const BRIDGE_MARKER_PREFIX = 'bridge_attempt:'
const BRIDGE_MARKER_TTL_MS = 60 * 1000

/**
 * One-shot loop breaker for the silent bridge. An authenticated visit with
 * a cross-app return_to auto-bridges at most once per minute per target:
 * if the product app fails to consume the handoff and bounces back here,
 * a second automatic attempt would loop forever, so the marker (plus
 * `?reason=bridge_failed`) downgrades to a manual "Continue" interstitial.
 */
export function shouldSuppressAutoBridge(returnTo: string): boolean {
  try {
    const stamp = sessionStorage.getItem(BRIDGE_MARKER_PREFIX + returnTo)
    if (!stamp) {
      return false
    }
    const at = Number(stamp)
    return Number.isFinite(at) && Date.now() - at < BRIDGE_MARKER_TTL_MS
  } catch {
    return false
  }
}

export function markBridgeAttempt(returnTo: string): void {
  try {
    sessionStorage.setItem(BRIDGE_MARKER_PREFIX + returnTo, String(Date.now()))
  } catch {
    // sessionStorage unavailable — worst case is a repeated auto-bridge
  }
}

/**
 * The raw `?return_to=` value, read after mount. Deliberately
 * window.location-based rather than useSearchParams(): the latter forces a
 * Suspense boundary on every consuming page during static prerender.
 */
export function useReturnTo(): string | null {
  const [raw, setRaw] = useState<string | null>(null)
  useEffect(() => {
    setRaw(new URLSearchParams(window.location.search).get('return_to'))
  }, [])
  return raw
}

/** Params carried across the login/register/forgot-password toggles. */
const CARRIED_PARAMS = ['return_to', 'invite'] as const

/**
 * Link builder that threads `return_to` and `invite` through same-app auth
 * links, so toggling between sign-in/sign-up/forgot-password never drops
 * the destination or a pending invitation. Query is resolved after mount
 * to keep server and first client render identical.
 */
export function useCarriedAuthParams(): (path: string) => string {
  const [query, setQuery] = useState('')
  useEffect(() => {
    const current = new URLSearchParams(window.location.search)
    const carried = new URLSearchParams()
    for (const key of CARRIED_PARAMS) {
      const value = current.get(key)
      if (value) {
        carried.set(key, value)
      }
    }
    setQuery(carried.toString())
  }, [])
  return useCallback(
    (path: string) => (query ? `${path}?${query}` : path),
    [query]
  )
}

/** The login-page URL that finishes routing for an in-flight return_to. */
export function loginPathWith(returnTo: string | null): string {
  return returnTo
    ? `/login?return_to=${encodeURIComponent(returnTo)}`
    : '/login'
}
