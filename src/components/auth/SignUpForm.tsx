'use client'

import type { AuthProviders } from '@robosystems/core'
import { TurnstileWidget } from '@robosystems/core/auth-components/TurnstileWidget'
import { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import { Spinner } from '@robosystems/core/ui-components'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PlatformIdentityHeader } from './PlatformIdentityHeader'
import {
  loginPathWith,
  parseDestination,
  useCarriedAuthParams,
  useReturnTo,
} from './return-to'

// Forked from @robosystems/core SignUpForm (0.6.3) for the centralized
// login home: registration carries the originating app (return_to →
// X-App-Source for email branding), routes back through /login for the
// onward bridge, and renders the platform identity.

export interface SignUpFormProps {
  apiUrl: string
  redirectTo?: string
  className?: string
  showConfirmPassword?: boolean
  showTermsAcceptance?: boolean
  turnstileSiteKey?: string // Cloudflare Turnstile site key for CAPTCHA
  /**
   * Organization invitation token, from the `?invite=` link in the email.
   * When present the form registers the user into the inviting organization
   * instead of creating a personal one, and the invited address is fixed —
   * the token is only valid for that email.
   */
  inviteToken?: string
}

interface InvitationPreview {
  org_name: string
  email: string
  role: string
  expires_at: string
}

export function SignUpForm({
  apiUrl,
  redirectTo = '/login',
  className = '',
  showConfirmPassword = true,
  showTermsAcceptance = true,
  turnstileSiteKey,
  inviteToken,
}: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    strength: string
    errors: string[]
    suggestions: string[]
    is_valid: boolean
  } | null>(null)
  const [checkingPassword, setCheckingPassword] = useState(false)
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null)
  const [inviteChecked, setInviteChecked] = useState(!inviteToken)
  const [providers, setProviders] = useState<AuthProviders | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const authClientRef = useRef(new RoboSystemsAuthClient(apiUrl))
  const rawReturnTo = useReturnTo()
  const withAuthParams = useCarriedAuthParams()

  const destination = parseDestination(rawReturnTo)
  const continuesTo = destination?.kind === 'app' ? destination.app : null

  // Posture is a rendering hint; a null result (endpoint missing, network
  // failure) renders the default open-registration posture — the backend
  // enforces regardless.
  useEffect(() => {
    let cancelled = false
    authClientRef.current.getAuthProviders().then((posture) => {
      if (!cancelled) {
        setProviders(posture)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Resolve the invitation before the form is usable. A token that no longer
  // resolves (revoked, expired, already accepted) degrades to ordinary
  // registration with a notice rather than a dead end.
  useEffect(() => {
    if (!inviteToken) return

    let cancelled = false
    setInviteChecked(false)
    authClientRef.current
      .getInvitation(inviteToken)
      .then((preview) => {
        if (cancelled) return
        if (preview) {
          setInvitation(preview)
          setFormData((prev) => ({ ...prev, email: preview.email }))
        } else {
          setError(
            'This invitation link is no longer valid. It may have expired or already been used. You can still create an account below.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setInviteChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [inviteToken])

  const checkPassword = useCallback(async (password: string, email: string) => {
    if (password.length < 4) {
      setPasswordStrength(null)
      return
    }
    setCheckingPassword(true)
    try {
      const result = await authClientRef.current.checkPasswordStrength(
        password,
        email || undefined
      )
      setPasswordStrength(result)
    } catch {
      setPasswordStrength(null)
    } finally {
      setCheckingPassword(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (formData.password.length < 4) {
      setPasswordStrength(null)
      return
    }
    debounceRef.current = setTimeout(() => {
      checkPassword(formData.password, formData.email)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [formData.password, formData.email, checkPassword])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setCaptchaError(null)
  }

  const handleCaptchaError = (error: string) => {
    setCaptchaError(error)
    setCaptchaToken(null)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken(null)
    setCaptchaError('CAPTCHA expired. Please verify again.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCaptchaError(null)

    // Validate confirm password if enabled
    if (showConfirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (checkingPassword) {
      setError('Checking password strength, please wait...')
      setLoading(false)
      return
    }
    if (passwordStrength && !passwordStrength.is_valid) {
      setError(
        passwordStrength.errors.length > 0
          ? passwordStrength.errors.join('. ')
          : 'Password does not meet requirements'
      )
      setLoading(false)
      return
    }

    // Check CAPTCHA if site key is provided (production mode)
    if (turnstileSiteKey && !captchaToken) {
      setError('Please complete the security verification to continue')
      setLoading(false)
      return
    }

    try {
      await authClientRef.current.register(
        formData.email,
        formData.password,
        formData.name,
        captchaToken || undefined,
        invitation ? inviteToken : undefined,
        // The verification email brands for the app the user came from;
        // post-centralization the Referer no longer distinguishes apps.
        continuesTo ? { appSource: continuesTo } : undefined
      )

      // Registration stores the session; /login finishes the routing —
      // silent bridge onward for a cross-app return_to, dashboard otherwise.
      window.location.href = rawReturnTo
        ? loginPathWith(rawReturnTo)
        : redirectTo
    } catch (error: unknown) {
      const err = error as { message?: string }
      // Check if it's a CAPTCHA-related error
      if (
        err?.message?.includes('CAPTCHA') ||
        err?.message?.includes('captcha')
      ) {
        setError(
          err.message || 'CAPTCHA verification failed. Please try again.'
        )
        // Reset CAPTCHA on failure
        setCaptchaToken(null)
      } else {
        setError(err?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const registrationEnabled = providers ? providers.registration : true

  if (!registrationEnabled && !inviteToken) {
    return (
      <div className="via-primary-950 flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <PlatformIdentityHeader
            title="Registration is by invitation"
            continuesTo={continuesTo}
          />
          <div className="border-primary-800 bg-primary-900/50 rounded-md border p-4 text-center">
            <p className="text-primary-200 text-sm">
              New accounts on this deployment are created by invitation only. If
              you were invited, use the link from your invitation email.
            </p>
          </div>
          <div className="text-center">
            <a
              href={withAuthParams('/login')}
              className="hover:text-primary-400 font-medium text-gray-300"
            >
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="via-primary-950 flex min-h-screen items-center justify-center bg-linear-to-br from-black to-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <PlatformIdentityHeader
            title={
              invitation
                ? `Join ${invitation.org_name}`
                : 'Create your RoboSystems account'
            }
            continuesTo={continuesTo}
          />
          {invitation && (
            <p className="mt-2 text-center text-sm text-gray-400">
              You&apos;ve been invited as{' '}
              <span className="font-medium text-gray-200">
                {invitation.role}
              </span>
              . Create your account to accept.
            </p>
          )}
        </div>
        <form
          className={['mt-8 space-y-6', className].filter(Boolean).join(' ')}
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {captchaError && (
            <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
              <div className="text-sm text-red-300">{captchaError}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
                placeholder="Full name"
                disabled={loading}
              />
            </div>
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
                readOnly={!!invitation}
                className={[
                  'focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset',
                  invitation ? 'cursor-not-allowed text-gray-300' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                placeholder="Email address"
                disabled={loading}
              />
              {invitation && (
                <p className="mt-1 text-xs text-gray-400">
                  The invitation was sent to this address and can only be
                  accepted with it.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
                placeholder="Password"
                disabled={loading}
              />
            </div>
            {showConfirmPassword && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
                  placeholder="Confirm password"
                  disabled={loading}
                />
              </div>
            )}
            <div className="min-h-[2.75rem]">
              {passwordStrength && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-300',
                          passwordStrength.score < 30
                            ? 'bg-red-500'
                            : passwordStrength.score < 60
                              ? 'bg-yellow-500'
                              : passwordStrength.score < 80
                                ? 'bg-primary-400'
                                : 'bg-green-500',
                        ].join(' ')}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <span
                      className={[
                        'text-xs font-medium capitalize',
                        passwordStrength.score < 30
                          ? 'text-red-400'
                          : passwordStrength.score < 60
                            ? 'text-yellow-400'
                            : passwordStrength.score < 80
                              ? 'text-primary-300'
                              : 'text-green-400',
                      ].join(' ')}
                    >
                      {passwordStrength.strength.replace('-', ' ')}
                    </span>
                  </div>
                  {passwordStrength.errors.length > 0 && (
                    <p className="text-xs text-red-400">
                      {passwordStrength.errors[0]}
                    </p>
                  )}
                  {passwordStrength.errors.length === 0 &&
                    passwordStrength.suggestions.length > 0 && (
                      <p className="text-xs text-gray-400">
                        {passwordStrength.suggestions[0]}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* CAPTCHA Widget - only show if site key is provided (production) */}
          {turnstileSiteKey && (
            <div className="flex justify-center">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                onExpire={handleCaptchaExpire}
                theme="dark"
                className="flex justify-center"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={
                loading ||
                checkingPassword ||
                !inviteChecked ||
                (turnstileSiteKey && !captchaToken)
              }
              className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
            >
              {(loading || !inviteChecked) && (
                <Spinner size="sm" className="mr-2 text-white" />
              )}
              {loading
                ? 'Creating account...'
                : !inviteChecked
                  ? 'Checking invitation...'
                  : invitation
                    ? 'Accept invitation'
                    : 'Create account'}
            </button>
          </div>

          {showTermsAcceptance && (
            <div className="text-center text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_ROBOSYSTEMS_APP_URL || 'https://robosystems.ai'}/pages/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 font-medium text-gray-300"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_ROBOSYSTEMS_APP_URL || 'https://robosystems.ai'}/pages/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 font-medium text-gray-300"
              >
                Privacy Policy
              </a>
            </div>
          )}

          <div className="text-center">
            <a
              href={withAuthParams('/login')}
              className="hover:text-primary-400 font-medium text-gray-300"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
