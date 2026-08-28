'use client'

import {
  createUserApiKey,
  listUserApiKeys,
  revokeUserApiKey,
  type ApiKeyInfo,
} from '@robosystems/client'
import {
  CreateApiKeyModal,
  EmptyState,
  GraphContext,
  SettingsCard,
} from '@robosystems/core'
import { ConfirmModal } from '@robosystems/core/ui-components'
import { Button, Spinner } from 'flowbite-react'
import type { ComponentProps, FC } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { HiKey } from 'react-icons/hi'
import { formatDate } from './format-date'

// App-local settings card. The login home is the only app that renders
// account settings, so this lives beside PasskeysCard and ConnectedAppsCard
// rather than in @robosystems/core, and shares their row anatomy: name,
// muted meta line, direct action button, confirm-before-destroy. Creation
// reuses the core CreateApiKeyModal (scope picker + one-time key reveal).
//
// The API lists active keys only — revocation is permanent and a revoked
// key never returns — so there is no status column to render.

interface ApiKeysCardProps {
  /** Link to the Connect page (the ready-made MCP connector-URL flow). */
  connectHref?: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

type CreateKeyHandler = ComponentProps<typeof CreateApiKeyModal>['onCreateKey']

export const ApiKeysCard: FC<ApiKeysCardProps> = ({
  connectHref,
  onSuccess,
  onError,
}) => {
  // Lenient read: outside a GraphProvider (tests) there is no scope picker
  // and graph-scoped keys show their raw graph id.
  const graphContext = useContext(GraphContext)
  const graphs = graphContext?.state.graphs ?? []
  const graphName = (graphId: string) =>
    graphs.find((graph) => graph.graphId === graphId)?.graphName

  const [keys, setKeys] = useState<ApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState<ApiKeyInfo | null>(null)
  const [revoking, setRevoking] = useState(false)

  const refresh = useCallback(async () => {
    setLoadError(false)
    const response = await listUserApiKeys()
    if (response.error || !response.data) {
      throw new Error('Failed to load API keys')
    }
    setKeys(response.data.api_keys ?? [])
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

  const handleCreate: CreateKeyHandler = async ({ name, graphId }) => {
    const response = await createUserApiKey({
      body: { name, graph_id: graphId },
    })
    if (response.error || !response.data) {
      throw new Error('Failed to create API key')
    }
    const { api_key: info, key } = response.data
    setKeys((rows) => [info, ...rows])
    void refresh().catch(() => {
      // The dialog is showing the new key; a stale list is not a create failure.
    })
    return {
      id: info.id,
      name: info.name,
      graphId: info.graph_id ?? undefined,
      key,
      createdAt: info.created_at,
      lastUsedAt: info.last_used_at ?? null,
      expiresAt: info.expires_at ?? null,
      isActive: info.is_active,
      isSystem: false,
    }
  }

  const handleRevoke = async () => {
    if (!pending) return
    const keyId = pending.id
    setRevoking(true)
    try {
      const response = await revokeUserApiKey({
        path: { api_key_id: keyId },
      })
      if (response.error) {
        throw new Error('Failed to revoke API key')
      }
      setKeys((rows) => rows.filter((row) => row.id !== keyId))
      setPending(null)
      onSuccess?.('API key revoked')
      void refresh().catch(() => {
        // The row is already gone locally; a stale refetch is not a revoke failure.
      })
    } catch {
      onError?.('Could not revoke this key. Try again.')
    } finally {
      setRevoking(false)
    }
  }

  const connectLink = connectHref && (
    <a
      href={connectHref}
      className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
    >
      Connect page
    </a>
  )

  return (
    <SettingsCard
      title="API keys"
      description="Long-lived keys for scripts, the SDKs, and MCP connector URLs."
      icon={HiKey}
    >
      <div className="space-y-4">
        {loading ? (
          <div
            className="flex items-center justify-center py-8"
            data-testid="api-keys-loading"
          >
            <Spinner size="lg" aria-label="Loading API keys" />
          </div>
        ) : loadError ? (
          <div className="space-y-3" data-testid="api-keys-error">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Couldn&apos;t load API keys. Reload to try again.
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
        ) : keys.length === 0 ? (
          <EmptyState
            icon={HiKey}
            headingLevel={4}
            className="py-8"
            title="No API keys yet"
            description={
              connectLink ? (
                <>
                  Create one for scripts and the SDKs. Connecting Claude or
                  another MCP client? The {connectLink} gives you a ready-made
                  connector URL instead.
                </>
              ) : (
                'Create one for scripts, the SDKs, and MCP connector URLs.'
              )
            }
            action={
              <Button size="sm" onClick={() => setCreating(true)}>
                Create API key
              </Button>
            }
          />
        ) : (
          <>
            <ul
              className="divide-y divide-zinc-200 dark:divide-zinc-700"
              data-testid="api-keys-list"
            >
              {keys.map((key) => (
                <li
                  key={key.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 break-words">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {key.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono">{key.prefix}…</span>
                      {' · '}
                      {key.graph_id
                        ? (graphName(key.graph_id) ?? (
                            <span className="font-mono">{key.graph_id}</span>
                          ))
                        : 'Account-wide'}
                      {' · '}
                      Created {formatDate(key.created_at)}
                      {' · '}
                      {key.last_used_at
                        ? `Last used ${formatDate(key.last_used_at)}`
                        : 'Never used'}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    color="light"
                    disabled={revoking}
                    data-testid={`revoke-${key.id}`}
                    onClick={() => setPending(key)}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700">
              {connectLink && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Connecting Claude or another MCP client? Generate a ready-made
                  connector URL from the {connectLink}.
                </p>
              )}
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button size="xs" onClick={() => setCreating(true)}>
                  Create API key
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        show={pending !== null}
        onClose={() => {
          if (!revoking) setPending(null)
        }}
        onConfirm={() => void handleRevoke()}
        title="Revoke API key"
        confirmLabel="Revoke"
        loadingLabel="Revoking…"
        confirmColor="failure"
        loading={revoking}
      >
        {pending && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Revoke <span className="font-medium">{pending.name}</span>? Anything
            still using it will be rejected on its next request. Revocation is
            permanent.
          </p>
        )}
      </ConfirmModal>

      <CreateApiKeyModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        onCreateKey={handleCreate}
        graphs={graphs.map((graph) => ({
          graphId: graph.graphId,
          graphName: graph.graphName,
        }))}
      />
    </SettingsCard>
  )
}
