'use client'

import type { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import type {
  AuthResponse,
  PasskeyEnrollmentResult,
} from '@robosystems/core/auth-core/types'
import { Spinner } from '@robosystems/core/ui-components'
import { startRegistration } from '@simplewebauthn/browser'
import React, { useState } from 'react'
import { browserPlatformHints, describePasskey } from './passkey-label'

// Passkey enrollment ceremony, used in two lanes:
// - forced (login returned mfa_enrollment_required): `mfaToken` is set and
//   completing the ceremony completes the login — the session token is
//   stored by core before onComplete fires.
// - settings (authenticated): no token; the caller just refreshes its list.
// The first passkey returns recovery codes exactly once; the user must
// acknowledge saving them before continuing.
// No name field: the browser runs the whole ceremony, and the label is
// derived from it (see passkey-label.ts).

export interface PasskeyEnrollmentProps {
  authClient: RoboSystemsAuthClient
  mfaToken?: string
  onComplete: (auth?: AuthResponse) => void | Promise<void>
  onCancel?: () => void
}

function isWebAuthnCancel(error: unknown): boolean {
  return error instanceof Error && error.name === 'NotAllowedError'
}

export function PasskeyEnrollment({
  authClient,
  mfaToken,
  onComplete,
  onCancel,
}: PasskeyEnrollmentProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PasskeyEnrollmentResult | null>(null)
  const [codesSaved, setCodesSaved] = useState(false)

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const options = await authClient.getPasskeyRegistrationOptions({
        mfaToken,
      })
      const credential = await startRegistration({
        // Opaque JSON from the backend RP library; the browser validates it.
        optionsJSON: options as never,
      })
      const enrollment = await authClient.completePasskeyEnrollment(
        credential as unknown as Record<string, unknown>,
        {
          name: describePasskey(credential, browserPlatformHints()),
          mfaToken,
        }
      )
      setResult(enrollment)
      if (!enrollment.recoveryCodes) {
        await onComplete(enrollment.auth)
        return
      }
    } catch (err: unknown) {
      if (!isWebAuthnCancel(err)) {
        setError('Passkey setup failed. Please try again.')
      }
    }
    setBusy(false)
  }

  const handleContinue = async () => {
    if (!result) return
    setBusy(true)
    await onComplete(result.auth)
  }

  // One-time recovery-code display: block continue until acknowledged.
  if (result?.recoveryCodes) {
    return (
      <div className="mt-8 space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Your passkey is set up. Save these one-time recovery codes somewhere
            safe — they are the backup way into your account and will not be
            shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-md border border-gray-700 bg-gray-800 p-4 font-mono text-sm text-gray-100">
            {result.recoveryCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(
                (result.recoveryCodes ?? []).join('\n')
              )
            }
            className="hover:text-primary-400 text-sm text-gray-300"
          >
            Copy codes
          </button>
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={codesSaved}
            onChange={(e) => setCodesSaved(e.target.checked)}
            className="text-primary-600 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800"
          />
          I saved my recovery codes
        </label>
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={!codesSaved || busy}
          className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Spinner size="sm" className="mr-2 text-white" />}
          Continue
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleEnroll} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      {mfaToken && (
        <div className="border-primary-800 bg-primary-900/50 rounded-md border p-4">
          <p className="text-primary-200 text-sm">
            Your role requires a passkey. Set one up now to finish signing in —
            it takes one browser prompt.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-400">
        Your browser will prompt for Touch ID, Face ID, Windows Hello, or a
        security key. There is nothing else to fill in.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="group bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 relative flex w-full justify-center rounded-md px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy && <Spinner size="sm" className="mr-2 text-white" />}
        {busy ? 'Waiting for your passkey…' : 'Create passkey'}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="hover:text-primary-400 block w-full text-center text-sm text-gray-400"
        >
          Cancel
        </button>
      )}
    </form>
  )
}
