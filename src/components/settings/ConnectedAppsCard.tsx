'use client'

import {
  listUserOAuthGrants,
  revokeUserOAuthGrant,
  type OAuthGrantInfo,
} from '@robosystems/client'
import { EmptyState, SettingsCard } from '@robosystems/core'
import { ConfirmModal } from '@robosystems/core/ui-components'
import { Button, Spinner } from 'flowbite-react'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { HiPuzzle } from 'react-icons/hi'
import { formatDate } from './format-date'

interface ConnectedAppsCardProps {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

function isHttpsUri(uri: string | null | undefined): uri is string {
  if (!uri) return false
  try {
    return new URL(uri).protocol === 'https:'
  } catch {
    return false
  }
}

function graphLabel(grant: OAuthGrantInfo): string {
  return grant.graph_name ?? grant.graph_id
}

export const ConnectedAppsCard: FC<ConnectedAppsCardProps> = ({
  onSuccess,
  onError,
}) => {
  const [grants, setGrants] = useState<OAuthGrantInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [pending, setPending] = useState<OAuthGrantInfo | null>(null)
  const [revoking, setRevoking] = useState(false)

  const refresh = useCallback(async () => {
    setLoadError(false)
    const response = await listUserOAuthGrants()
    if (response.error || !response.data) {
      throw new Error('Failed to load connected apps')
    }
    setGrants(response.data.grants ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refresh()
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  const handleRevoke = async () => {
    if (!pending) return
    const grantId = pending.id
    setRevoking(true)
    try {
      const response = await revokeUserOAuthGrant({
        path: { grant_id: grantId },
      })
      if (response.error) {
        throw new Error('Failed to revoke connected app')
      }
      setGrants((rows) => rows.filter((row) => row.id !== grantId))
      setPending(null)
      onSuccess?.('Connected app revoked')
      void refresh().catch(() => {
        // The row is already gone locally; a stale refetch is not a revoke failure.
      })
    } catch {
      onError?.('Could not revoke this app. Try again.')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <SettingsCard
      title="Connected apps"
      description="MCP clients you've authorized — Claude, ChatGPT, Cursor, VS Code, and anything else that signed in through OAuth."
      icon={HiPuzzle}
    >
      {loading ? (
        <div
          className="flex items-center justify-center py-8"
          data-testid="connected-apps-loading"
        >
          <Spinner size="lg" aria-label="Loading connected apps" />
        </div>
      ) : loadError ? (
        <div className="space-y-3" data-testid="connected-apps-error">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Couldn&apos;t load connected apps. Reload to try again.
          </p>
          <Button
            size="xs"
            color="light"
            onClick={() => {
              setLoading(true)
              refresh()
                .catch(() => setLoadError(true))
                .finally(() => setLoading(false))
            }}
          >
            Reload
          </Button>
        </div>
      ) : grants.length === 0 ? (
        <EmptyState
          icon={HiPuzzle}
          headingLevel={4}
          className="py-8"
          title="No apps connected"
          description="When you connect Claude, ChatGPT, Cursor, or VS Code over MCP, they appear here."
        />
      ) : (
        <ul
          className="divide-y divide-zinc-200 dark:divide-zinc-700"
          data-testid="connected-apps-list"
        >
          {grants.map((grant) => (
            <li
              key={grant.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 break-words">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {isHttpsUri(grant.client_uri) ? (
                    <a
                      href={grant.client_uri}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-zinc-300 underline-offset-4 dark:decoration-zinc-700"
                    >
                      {grant.client_name}
                    </a>
                  ) : (
                    grant.client_name
                  )}
                  {!grant.client_is_trusted && (
                    <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Unverified
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {grant.graph_name ? (
                    grant.graph_name
                  ) : (
                    <span className="font-mono">{grant.graph_id}</span>
                  )}
                  {' · '}
                  Connected {formatDate(grant.created_at)}
                  {grant.last_used_at
                    ? ` · Last used ${formatDate(grant.last_used_at)}`
                    : ''}
                </p>
              </div>
              <Button
                size="xs"
                color="light"
                disabled={revoking}
                data-testid={`revoke-${grant.id}`}
                onClick={() => setPending(grant)}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        show={pending !== null}
        onClose={() => {
          if (!revoking) setPending(null)
        }}
        onConfirm={() => void handleRevoke()}
        title="Revoke connected app"
        confirmLabel="Revoke"
        loadingLabel="Revoking…"
        confirmColor="failure"
        loading={revoking}
      >
        {pending && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Revoke <span className="font-medium">{pending.client_name}</span> on{' '}
            <span className="font-medium">{graphLabel(pending)}</span>? The next
            request from this app will fail and it will ask you to authorize
            again.
          </p>
        )}
      </ConfirmModal>
    </SettingsCard>
  )
}
