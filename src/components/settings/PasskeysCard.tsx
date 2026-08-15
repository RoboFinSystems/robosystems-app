'use client'

import {
  browserPlatformHints,
  describePasskey,
} from '@/components/auth/passkey-label'
import { EmptyState, SettingsCard } from '@robosystems/core'
import { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import { ConfirmModal } from '@robosystems/core/ui-components'
import { startRegistration } from '@simplewebauthn/browser'
import { Button } from 'flowbite-react'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiKey } from 'react-icons/hi'

// App-local settings card (the passkey UI deliberately lives in the login
// home, never in @robosystems/core): list/enroll/remove passkeys and manage
// recovery codes. Enrollment, removal, and code regeneration all
// re-authenticate with the current password — the hijacked-session defense;
// the backend refuses a settings-lane ceremony on a session alone.
//
// There is no "name your passkey" input: WebAuthn never asks for one, and
// neither does any browser or password manager. The label is derived from the
// ceremony (device / security key) so the list stays distinguishable.

interface PasskeyRow {
  id: string
  name: string
  created_at: string
  last_used_at?: string | null
  backup_eligible: boolean
}

interface PasskeysCardProps {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

function isWebAuthnCancel(error: unknown): boolean {
  return error instanceof Error && error.name === 'NotAllowedError'
}

export const PasskeysCard: FC<PasskeysCardProps> = ({ onSuccess, onError }) => {
  const authClient = useMemo(
    () =>
      new RoboSystemsAuthClient(
        process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'http://localhost:8000'
      ),
    []
  )

  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([])
  const [codesRemaining, setCodesRemaining] = useState<number | null>(null)
  const [available, setAvailable] = useState(true)
  const [busy, setBusy] = useState(false)
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null)
  // Pending credential-surface action awaiting password re-auth.
  const [pending, setPending] = useState<
    | { kind: 'add' }
    | { kind: 'delete'; passkey: PasskeyRow }
    | { kind: 'regenerate' }
    | null
  >(null)
  const [password, setPassword] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [list, status] = await Promise.all([
        authClient.listPasskeys(),
        authClient.getMfaStatus(),
      ])
      setPasskeys(list as unknown as PasskeyRow[])
      setCodesRemaining(status ? status.recoveryCodesRemaining : null)
      setAvailable(true)
    } catch {
      // 403 = passkeys disabled on this deployment; hide the card body.
      setAvailable(false)
    }
  }, [authClient])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleEnroll = async (currentPassword: string) => {
    // The password is consumed at options time — the ceremony that follows
    // is bound to the challenge that proof unlocked.
    const options = await authClient.getPasskeyRegistrationOptions({
      password: currentPassword,
    })
    const credential = await startRegistration({
      optionsJSON: options as never,
    })
    const result = await authClient.completePasskeyEnrollment(
      credential as unknown as Record<string, unknown>,
      { name: describePasskey(credential, browserPlatformHints()) }
    )
    if (result.recoveryCodes) {
      setFreshCodes(result.recoveryCodes)
    }
    onSuccess?.('Passkey added')
  }

  const handleConfirmPending = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'add') {
        await handleEnroll(password)
      } else if (pending.kind === 'delete') {
        await authClient.deletePasskey(pending.passkey.id, { password })
        onSuccess?.('Passkey removed')
      } else {
        const codes = await authClient.regenerateRecoveryCodes({ password })
        setFreshCodes(codes)
        onSuccess?.('Recovery codes regenerated')
      }
      setPending(null)
      setPassword('')
      await refresh()
    } catch (err: unknown) {
      if (pending.kind === 'add' && isWebAuthnCancel(err)) {
        // Backing out of the browser prompt is not an error; the modal
        // closes and nothing changed.
        setPending(null)
        setPassword('')
      } else {
        const status = err as {
          status?: number
          response?: { status?: number }
        }
        const code = status?.status ?? status?.response?.status
        onError?.(
          pending.kind === 'add'
            ? code === 401
              ? 'Re-authentication failed'
              : 'Passkey setup failed'
            : code === 409
              ? 'Your role requires MFA — add another passkey before removing this one.'
              : 'Re-authentication failed'
        )
      }
    } finally {
      setBusy(false)
    }
  }

  if (!available) {
    return null
  }

  return (
    <SettingsCard
      title="Passkeys"
      description="Sign in with your device's screen lock — phishing-resistant and faster than a password."
      icon={HiKey}
    >
      <div className="space-y-4">
        {passkeys.length === 0 ? (
          <EmptyState
            icon={HiKey}
            headingLevel={4}
            className="py-8"
            title="No passkeys yet"
            description="Add one and you can sign in with Touch ID, Face ID, Windows Hello, or a security key — no password to type or phish."
            action={
              <Button
                size="sm"
                disabled={busy}
                onClick={() => setPending({ kind: 'add' })}
              >
                Create a passkey
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {passkeys.map((pk) => (
              <li
                key={pk.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {pk.name}
                    {pk.backup_eligible && (
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        synced
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Added {new Date(pk.created_at).toLocaleDateString()}
                    {pk.last_used_at
                      ? ` · Last used ${new Date(pk.last_used_at).toLocaleDateString()}`
                      : ''}
                  </p>
                </div>
                <Button
                  size="xs"
                  color="light"
                  disabled={busy}
                  onClick={() => setPending({ kind: 'delete', passkey: pk })}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        {passkeys.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recovery codes remaining:{' '}
              <span className="font-medium">{codesRemaining ?? '—'}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                color="light"
                disabled={busy}
                onClick={() => setPending({ kind: 'regenerate' })}
              >
                Regenerate codes
              </Button>
              <Button
                size="xs"
                disabled={busy}
                onClick={() => setPending({ kind: 'add' })}
              >
                Add another passkey
              </Button>
            </div>
          </div>
        )}

        {freshCodes && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
            <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              Save these recovery codes now — they will not be shown again.
            </p>
            <div className="grid grid-cols-2 gap-1 font-mono text-sm text-amber-900 dark:text-amber-100">
              {freshCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="xs"
                color="light"
                onClick={() =>
                  navigator.clipboard?.writeText(freshCodes.join('\n'))
                }
              >
                Copy
              </Button>
              <Button size="xs" onClick={() => setFreshCodes(null)}>
                I saved them
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        show={pending !== null}
        onClose={() => {
          setPending(null)
          setPassword('')
        }}
        onConfirm={() => void handleConfirmPending()}
        title={
          pending?.kind === 'add'
            ? 'Add a passkey'
            : pending?.kind === 'regenerate'
              ? 'Regenerate recovery codes'
              : 'Remove passkey'
        }
        confirmLabel={
          pending?.kind === 'add'
            ? 'Continue'
            : pending?.kind === 'regenerate'
              ? 'Regenerate'
              : 'Remove'
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {pending?.kind === 'add'
              ? 'Confirm your password, then follow your browser’s prompt — Touch ID, Face ID, Windows Hello, or a security key. Nothing else to fill in.'
              : pending?.kind === 'regenerate'
                ? 'Your current recovery codes will stop working. Confirm your password to continue.'
                : `"${pending?.kind === 'delete' ? pending.passkey.name : ''}" will no longer be able to sign in to your account. Confirm your password to continue.`}
          </p>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="focus:ring-primary-500 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-zinc-900 ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-inset dark:bg-zinc-800 dark:text-white dark:ring-zinc-600"
          />
        </div>
      </ConfirmModal>
    </SettingsCard>
  )
}
