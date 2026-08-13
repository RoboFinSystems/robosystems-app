'use client'

import type { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import { Spinner } from '@robosystems/core/ui-components'
import { startAuthentication } from '@simplewebauthn/browser'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// The second-factor step of the login handshake: the password was correct,
// the account has a passkey, and the short-lived mfa_token from the login
// response authorizes exactly this exchange. Success mints the real session
// (core stores the token); the caller resumes its normal post-auth routing.

export interface MfaChallengeProps {
  authClient: RoboSystemsAuthClient
  mfaToken: string
  onSuccess: () => void | Promise<void>
  /** Return to the password form — the token died or the user backed out. */
  onRestart: () => void
}

/** A user gesture cancelling the browser prompt is not an error state. */
function isWebAuthnCancel(error: unknown): boolean {
  return error instanceof Error && error.name === 'NotAllowedError'
}

export function MfaChallenge({
  authClient,
  mfaToken,
  onSuccess,
  onRestart,
}: MfaChallengeProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState('')
  const startedRef = useRef(false)

  const runPasskey = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const options = await authClient.getMfaOptions(mfaToken)
      const assertion = await startAuthentication({
        // Opaque JSON from the backend RP library; the browser validates it.
        optionsJSON: options as never,
      })
      await authClient.verifyMfa(mfaToken, {
        assertion: assertion as unknown as Record<string, unknown>,
      })
      await onSuccess()
      return
    } catch (err: unknown) {
      if (!isWebAuthnCancel(err)) {
        setError(
          'Passkey verification failed. Try again, use a recovery code, or start over.'
        )
      }
    }
    setBusy(false)
  }, [authClient, mfaToken, onSuccess])

  // Kick off the browser prompt immediately — the user already proved the
  // password; the natural next beat is the authenticator gesture.
  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true
    void runPasskey()
  }, [runPasskey])

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await authClient.verifyMfa(mfaToken, { recoveryCode })
      await onSuccess()
      return
    } catch {
      setError('That recovery code was not accepted.')
    }
    setBusy(false)
  }

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      {!showRecovery ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">
            Confirm it&apos;s you with your passkey to finish signing in.
          </p>
          <button
            type="button"
            onClick={() => void runPasskey()}
            disabled={busy}
            className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Spinner size="sm" className="mr-2 text-white" />}
            {busy ? 'Waiting for your passkey…' : 'Use passkey'}
          </button>
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="hover:text-primary-400 text-sm text-gray-300"
          >
            Use a recovery code instead
          </button>
        </div>
      ) : (
        <form onSubmit={handleRecoverySubmit} className="space-y-4">
          <div>
            <label htmlFor="recovery-code" className="sr-only">
              Recovery code
            </label>
            <input
              id="recovery-code"
              name="recovery-code"
              type="text"
              autoComplete="one-time-code"
              required
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              className="focus:ring-primary-500 relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset"
              placeholder="Recovery code (e.g. ABCDE-FGHJK)"
              disabled={busy}
            />
          </div>
          <button
            type="submit"
            disabled={busy || !recoveryCode.trim()}
            className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Spinner size="sm" className="mr-2 text-white" />}
            Verify recovery code
          </button>
          <button
            type="button"
            onClick={() => setShowRecovery(false)}
            className="hover:text-primary-400 block w-full text-center text-sm text-gray-300"
          >
            Back to passkey
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="hover:text-primary-400 block w-full text-center text-sm text-gray-400"
      >
        Start over
      </button>
    </div>
  )
}
