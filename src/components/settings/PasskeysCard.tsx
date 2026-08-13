'use client'

import { SettingsCard } from '@robosystems/core'
import { RoboSystemsAuthClient } from '@robosystems/core/auth-core/client'
import { ConfirmModal } from '@robosystems/core/ui-components'
import { startRegistration } from '@simplewebauthn/browser'
import { Button } from 'flowbite-react'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiKey } from 'react-icons/hi'

// App-local settings card (the passkey UI deliberately lives in the login
// home, never in @robosystems/core): list/enroll/remove passkeys and manage
// recovery codes. Removal and code regeneration re-authenticate with the
// current password — the hijacked-session defense.

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
  const [newName, setNewName] = useState('')
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null)
  // Pending destructive action awaiting password re-auth.
  const [pending, setPending] = useState<
    { kind: 'delete'; passkey: PasskeyRow } | { kind: 'regenerate' } | null
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

  const handleEnroll = async () => {
    setBusy(true)
    try {
      const options = await authClient.getPasskeyRegistrationOptions()
      const credential = await startRegistration({
        optionsJSON: options as never,
      })
      const result = await authClient.completePasskeyEnrollment(
        credential as unknown as Record<string, unknown>,
        { name: newName.trim() || undefined }
      )
      setNewName('')
      if (result.recoveryCodes) {
        setFreshCodes(result.recoveryCodes)
      }
      onSuccess?.('Passkey added')
      await refresh()
    } catch (err: unknown) {
      if (!isWebAuthnCancel(err)) {
        onError?.('Passkey setup failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmPending = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'delete') {
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
      const status = err as { status?: number; response?: { status?: number } }
      const code = status?.status ?? status?.response?.status
      onError?.(
        code === 409
          ? 'Your role requires MFA — add another passkey before removing this one.'
          : 'Re-authentication failed'
      )
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
        {passkeys.length > 0 && (
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

        <div className="flex items-center gap-2">
          <input
            type="text"
            maxLength={100}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Passkey name (optional)"
            className="focus:ring-primary-500 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-zinc-900 ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-inset dark:bg-zinc-800 dark:text-white dark:ring-zinc-600"
            disabled={busy}
          />
          <Button size="sm" disabled={busy} onClick={() => void handleEnroll()}>
            Add passkey
          </Button>
        </div>

        {passkeys.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recovery codes remaining:{' '}
              <span className="font-medium">{codesRemaining ?? '—'}</span>
            </p>
            <Button
              size="xs"
              color="light"
              disabled={busy}
              onClick={() => setPending({ kind: 'regenerate' })}
            >
              Regenerate codes
            </Button>
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
          pending?.kind === 'regenerate'
            ? 'Regenerate recovery codes'
            : 'Remove passkey'
        }
        confirmLabel={pending?.kind === 'regenerate' ? 'Regenerate' : 'Remove'}
      >
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {pending?.kind === 'regenerate'
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
