'use client'

import type { AuthUser } from '@robosystems/core'
import { useOptionalAuth } from '@robosystems/core/auth-components'
import { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import { getAppConfig } from '@robosystems/core/auth-core/config'
import { useSSO } from '@robosystems/core/auth-core/sso'
import { LogoBadge, Spinner } from '@robosystems/core/ui-components'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PlatformIdentityHeader } from './PlatformIdentityHeader'
import { fetchAuthProviders, type AuthProviders } from './providers'
import {
  markBridgeAttempt,
  parseDestination,
  shouldSuppressAutoBridge,
  useCarriedAuthParams,
} from './return-to'

// Forked from @robosystems/core SignInForm (0.6.3) for the centralized
// login home: this surface owns return_to routing, the silent cross-app
// bridge, and posture-driven rendering, none of which belong in the
// shared library the product apps consume.

export interface SignInFormProps {
  apiUrl: string
  redirectTo?: string
  className?: string
}

/**
 * Map a login failure to a user-facing message. A connectivity failure (the
 * request never reached the server — `fetch` throws a `TypeError`) must NOT be
 * reported as bad credentials: that sends users to reset a password that is
 * actually correct. Reached-server auth rejection (401/403, or an empty/invalid
 * auth body) stays "Invalid email or password"; 5xx gets its own message.
 */
export function loginErrorMessage(error: unknown): string {
  const err = error as {
    status?: number
    response?: { status?: number }
    message?: string
  }
  const status = err?.status ?? err?.response?.status
  const message = String(err?.message ?? '')

  if (
    error instanceof TypeError ||
    /failed to fetch|networkerror|load failed|fetch failed|err_(connection|network|name_not_resolved)/i.test(
      message
    )
  ) {
    return 'Unable to reach the server. Check your connection and try again.'
  }
  if (typeof status === 'number' && status >= 500) {
    return 'The server ran into a problem. Please try again in a moment.'
  }
  return 'Invalid email or password'
}

/**
 * Messages for the `?reason=` a redirect into the login page can carry.
 * Producers: `AuthProvider.logout(reason)` and, for `bridge_failed`, a
 * product app's LoginRedirector after a handoff it could not consume.
 */
export const SIGN_IN_NOTICES: Record<string, string> = {
  password_changed:
    'Your password was updated. Please sign in with your new password.',
  session_expired: 'Your session expired. Please sign in again.',
  session_invalid: 'Your session is no longer valid. Please sign in again.',
  bridge_failed: "Automatic sign-in didn't complete. Sign in to continue.",
}

interface BridgeInterstitial {
  user: AuthUser
  targetApp: string
  targetPath: string | null
  returnTo: string
}

export function SignInForm({
  apiUrl,
  redirectTo = '/home',
  className = '',
}: SignInFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ssoChecking, setSSOChecking] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [notice, setNotice] = useState('')
  const [providers, setProviders] = useState<AuthProviders | null>(null)
  const [continuesTo, setContinuesTo] = useState<string | null>(null)
  const [interstitial, setInterstitial] = useState<BridgeInterstitial | null>(
    null
  )
  const startedRef = useRef(false)
  const auth = useOptionalAuth()
  const withAuthParams = useCarriedAuthParams()

  // Read via window.location rather than useSearchParams(): the latter forces
  // the consuming page to wrap this component in a Suspense boundary during
  // static prerender. Runs before the auth-check effect below, which strips
  // its own params from the URL.
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason')
    if (reason && SIGN_IN_NOTICES[reason]) {
      setNotice(SIGN_IN_NOTICES[reason])
    }
  }, [])

  // Posture is a rendering hint fetched in parallel with the auth check; a
  // null result (endpoint missing, network failure) renders the default
  // password posture — the backend enforces regardless.
  useEffect(() => {
    let cancelled = false
    fetchAuthProviders(apiUrl).then((posture) => {
      if (!cancelled) {
        setProviders(posture)
      }
    })
    return () => {
      cancelled = true
    }
  }, [apiUrl])

  const authClient = useMemo(() => new RoboSystemsAuthClient(apiUrl), [apiUrl])
  const { checkSSOAuthentication, handleSSOLogin, navigateToApp } =
    useSSO(apiUrl)

  /**
   * Post-auth routing. A cross-app return_to initiates the SSO bridge to
   * the product app (recording the one-shot marker so a failed handoff
   * cannot auto-loop); a local return_to or none lands on this app.
   */
  const routeAfterAuth = async (rawReturnTo: string | null) => {
    const destination = parseDestination(rawReturnTo)
    setRedirecting(true)
    if (destination?.kind === 'app' && rawReturnTo) {
      markBridgeAttempt(rawReturnTo)
      await navigateToApp(destination.app, destination.path ?? undefined)
      return
    }
    window.location.href =
      destination?.kind === 'local' ? destination.path : redirectTo
  }

  // Check for an inbound bridge handoff or an existing session on mount
  useEffect(() => {
    // One-shot: handleSSOLogin consumes and strips ?session_id=, so a
    // StrictMode re-run would misread the URL state.
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const checkAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const ssoReturnUrl = urlParams.get('returnUrl')
        const rawReturnTo = urlParams.get('return_to')
        const reason = urlParams.get('reason')

        const arrivalDestination = parseDestination(rawReturnTo)
        if (arrivalDestination?.kind === 'app') {
          setContinuesTo(arrivalDestination.app)
        }

        // 1. Inbound handoff (?session_id=) from a product app's own bridge
        // producers — consume it exactly as before centralization.
        const ssoUser = await handleSSOLogin()
        if (ssoUser) {
          setRedirecting(true)
          // handleSSOLogin schedules navigation to returnUrl if present;
          // only redirect to the default if no returnUrl was specified
          if (!ssoReturnUrl) {
            window.location.href = redirectTo
          }
          return
        }

        // 2. Anchor session already alive: silent SSO. Bridge onward for a
        // cross-app return_to — unless this attempt already bounced
        // (reason=bridge_failed or a fresh marker), which downgrades to a
        // manual interstitial instead of an automatic redirect loop.
        const existingUser = await checkSSOAuthentication()
        if (existingUser) {
          const destination = parseDestination(rawReturnTo)
          if (destination?.kind === 'app' && rawReturnTo) {
            if (
              reason === 'bridge_failed' ||
              shouldSuppressAutoBridge(rawReturnTo)
            ) {
              setInterstitial({
                user: existingUser,
                targetApp: destination.app,
                targetPath: destination.path,
                returnTo: rawReturnTo,
              })
              setSSOChecking(false)
              return
            }
          }
          await routeAfterAuth(rawReturnTo)
          return
        }

        setSSOChecking(false)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth check failed:', error)
        }
        setSSOChecking(false)
      }
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authClient.login(formData.email, formData.password)
      const rawReturnTo = new URLSearchParams(window.location.search).get(
        'return_to'
      )
      await routeAfterAuth(rawReturnTo)
    } catch (error: unknown) {
      setError(loginErrorMessage(error))
      setLoading(false)
    }
  }

  const handleContinueBridge = async () => {
    if (!interstitial) return
    setRedirecting(true)
    markBridgeAttempt(interstitial.returnTo)
    await navigateToApp(
      interstitial.targetApp,
      interstitial.targetPath ?? undefined
    )
  }

  const handleSignOutInstead = async () => {
    // Land back on this URL: with the session gone the form renders and
    // the (still-suppressed) return_to rides the next manual sign-in.
    await auth?.logout(undefined, { redirectTo: window.location.href })
  }

  const passwordAuthEnabled = providers ? providers.password_auth : true
  const registrationEnabled = providers ? providers.registration : true

  if (ssoChecking || redirecting) {
    return (
      <div className="via-primary-950 flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900 p-6">
        <div className="w-full max-w-md">
          <div className="text-center">
            <LogoBadge animate="loop" className="mx-auto h-16 w-16" />
            <h1 className="font-heading mt-4 text-center text-2xl font-semibold tracking-tight text-white">
              RoboSystems
            </h1>
          </div>
        </div>
      </div>
    )
  }

  if (interstitial) {
    const targetName = getAppConfig(interstitial.targetApp).displayName
    return (
      <div className="via-primary-950 flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <PlatformIdentityHeader
            title="You're signed in"
            continuesTo={interstitial.targetApp}
          />
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-300">
              Signed in as{' '}
              <span className="font-medium text-white">
                {interstitial.user.email}
              </span>
            </p>
            <button
              type="button"
              onClick={handleContinueBridge}
              className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
            >
              Continue to {targetName}
            </button>
            <button
              type="button"
              onClick={handleSignOutInstead}
              className="hover:text-primary-400 text-sm text-gray-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="via-primary-950 flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <PlatformIdentityHeader
          title="Sign in to your account"
          continuesTo={continuesTo}
        />
        {!passwordAuthEnabled ? (
          <div className="border-primary-800 bg-primary-900/50 rounded-md border p-4 text-center">
            <p className="text-primary-200 text-sm">
              {providers?.oidc.enabled
                ? `Sign-in for this deployment is managed by your organization${
                    providers.oidc.provider_label
                      ? ` via ${providers.oidc.provider_label}`
                      : ''
                  }.`
                : 'Password sign-in is disabled on this deployment.'}
            </p>
          </div>
        ) : (
          <form
            className={['mt-8 space-y-6', className].filter(Boolean).join(' ')}
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}

            {notice && !error && (
              <div className="border-primary-800 bg-primary-900/50 rounded-md border p-4">
                <div className="text-primary-200 text-sm">{notice}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
                  placeholder="Email address"
                  disabled={loading || redirecting}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
                  placeholder="Password"
                  disabled={loading || redirecting}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || redirecting}
                className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Spinner size="sm" className="mr-2 text-white" />}
                {redirecting
                  ? 'Redirecting...'
                  : loading
                    ? 'Signing in...'
                    : 'Sign in'}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <a
                href={withAuthParams('/auth/forgot-password')}
                className="hover:text-primary-400 text-sm text-gray-300"
              >
                Forgot password?
              </a>
              {registrationEnabled && (
                <a
                  href={withAuthParams('/register')}
                  className="hover:text-primary-400 text-sm font-medium text-gray-300"
                >
                  Don&apos;t have an account? Sign up
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
