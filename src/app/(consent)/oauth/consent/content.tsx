'use client'

import {
  ConsentError,
  fetchPendingAuthorization,
  isValidRequestId,
  submitConsentDecision,
  type PendingAuthorization,
} from '@/lib/oauth-consent'
import { useGraphContext } from '@robosystems/core'
import { Alert, Button, Card, Label, Radio, Spinner } from 'flowbite-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { HiExclamation, HiLockClosed, HiShieldCheck } from 'react-icons/hi'

interface ConsentFailure {
  kind: ConsentError['kind']
  message: string
}

const FAILURE_COPY: Record<ConsentError['kind'], string> = {
  expired:
    'This authorization request has expired or was already answered. Go back to the app and connect again.',
  forbidden: "You don't have access to that graph.",
  unauthenticated: 'Your session ended. Sign in and try again.',
  unknown:
    'Something went wrong while loading this request. Go back to the app and try again.',
}

function toFailure(error: unknown): ConsentFailure {
  if (error instanceof ConsentError) {
    return { kind: error.kind, message: FAILURE_COPY[error.kind] }
  }
  return { kind: 'unknown', message: FAILURE_COPY.unknown }
}

/**
 * Where approval sends the browser, in words a person can check against
 * what they expect. The MCP authorization spec requires the consent screen
 * to show the redirect's host, and to warn when it is the local machine.
 */
function Destination({ pending }: { pending: PendingAuthorization }) {
  if (pending.is_loopback_redirect) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        After you approve, you&apos;ll be sent back to{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          an app running on this computer
        </span>{' '}
        ({pending.redirect_host}). Only continue if you just started connecting
        from an app you trust.
      </p>
    )
  }
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      After you approve, you&apos;ll be sent to{' '}
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {pending.redirect_host}
      </span>
      .
    </p>
  )
}

export function ConsentContent() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get('request_id')
  const { state: graphState } = useGraphContext()

  const [pending, setPending] = useState<PendingAuthorization | null>(null)
  const [failure, setFailure] = useState<ConsentFailure | null>(null)
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<'approve' | 'deny' | null>(null)

  useEffect(() => {
    if (!isValidRequestId(requestId)) {
      setFailure({ kind: 'expired', message: FAILURE_COPY.expired })
      return
    }
    let cancelled = false
    fetchPendingAuthorization(requestId)
      .then((loaded) => {
        if (!cancelled) setPending(loaded)
      })
      .catch((error: unknown) => {
        if (!cancelled) setFailure(toFailure(error))
      })
    return () => {
      cancelled = true
    }
  }, [requestId])

  const ownGraphs = useMemo(
    () => graphState.graphs.filter((graph) => !graph.isRepository),
    [graphState.graphs]
  )
  const repositories = useMemo(
    () => graphState.graphs.filter((graph) => graph.isRepository),
    [graphState.graphs]
  )

  // Default selection: the graph fixed by a per-graph URL; otherwise the
  // graph the user is already working in; otherwise their first own graph.
  useEffect(() => {
    if (!pending || selectedGraphId) return
    if (pending.graph_id) {
      setSelectedGraphId(pending.graph_id)
      return
    }
    if (graphState.isLoading) return
    const current = graphState.graphs.find(
      (graph) => graph.graphId === graphState.currentGraphId
    )
    const first = ownGraphs[0] ?? graphState.graphs[0]
    setSelectedGraphId(current?.graphId ?? first?.graphId ?? null)
  }, [pending, selectedGraphId, graphState, ownGraphs])

  const fixedGraph = pending?.graph_id
    ? (graphState.graphs.find((graph) => graph.graphId === pending.graph_id) ??
      null)
    : null

  const decide = async (approved: boolean) => {
    if (!pending || !isValidRequestId(requestId)) return
    setSubmitting(approved ? 'approve' : 'deny')
    try {
      const redirectTo = await submitConsentDecision(requestId, {
        approved,
        graph_id: approved ? selectedGraphId : null,
      })
      window.location.href = redirectTo
    } catch (error: unknown) {
      setFailure(toFailure(error))
      setSubmitting(null)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Card className="w-full max-w-lg">
        {failure ? (
          <div className="space-y-3" data-testid="consent-failure">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Can&apos;t continue
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {failure.message}
            </p>
            {failure.kind === 'unauthenticated' &&
              isValidRequestId(requestId) && (
                <Link
                  href={`/login?return_to=${encodeURIComponent(
                    `/oauth/consent?request_id=${requestId}`
                  )}`}
                  className="inline-block text-sm font-medium underline underline-offset-4"
                  data-testid="sign-in-again"
                >
                  Sign in to continue
                </Link>
              )}
          </div>
        ) : !pending ? (
          <div
            className="flex items-center justify-center py-8"
            data-testid="consent-loading"
          >
            <Spinner size="lg" aria-label="Loading authorization request" />
          </div>
        ) : (
          <div className="space-y-6">
            <header className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
                Authorize access
              </p>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {pending.client_uri ? (
                  <a
                    href={pending.client_uri}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-zinc-300 underline-offset-4 dark:decoration-zinc-700"
                  >
                    {pending.client_name}
                  </a>
                ) : (
                  pending.client_name
                )}{' '}
                wants to use RoboSystems on your behalf
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                It will be able to use the MCP tools on one graph, with the
                access your role already gives you. You can revoke this at any
                time.
              </p>
            </header>

            {!pending.is_trusted && (
              <Alert color="warning" icon={HiExclamation}>
                <span className="font-medium">
                  This app isn&apos;t verified by RoboSystems.
                </span>{' '}
                Only continue if you started this connection yourself.
              </Alert>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {pending.graph_id ? 'Graph' : 'Choose the graph to connect'}
              </h2>
              {pending.graph_id ? (
                <div
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                  data-testid="fixed-graph"
                >
                  <HiLockClosed className="h-4 w-4 text-zinc-500" aria-hidden />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {fixedGraph?.graphName ?? pending.graph_id}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    {pending.graph_id}
                  </span>
                </div>
              ) : graphState.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Spinner size="sm" aria-label="Loading graphs" /> Loading your
                  graphs…
                </div>
              ) : graphState.error ? (
                <p
                  className="text-sm text-zinc-600 dark:text-zinc-400"
                  data-testid="graphs-error"
                >
                  Your graphs couldn&apos;t be loaded. Reload the page to try
                  again.
                </p>
              ) : graphState.graphs.length === 0 ? (
                <p
                  className="text-sm text-zinc-600 dark:text-zinc-400"
                  data-testid="no-graphs"
                >
                  You don&apos;t have any graphs yet. Create one first, then
                  connect again.
                </p>
              ) : (
                <fieldset className="space-y-4" data-testid="graph-picker">
                  <legend className="sr-only">Graph</legend>
                  {ownGraphs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Your graphs
                      </p>
                      {ownGraphs.map((graph) => (
                        <div
                          key={graph.graphId}
                          className="flex items-center gap-2"
                        >
                          <Radio
                            id={`graph-${graph.graphId}`}
                            name="graph"
                            value={graph.graphId}
                            checked={selectedGraphId === graph.graphId}
                            onChange={() => setSelectedGraphId(graph.graphId)}
                          />
                          <Label
                            htmlFor={`graph-${graph.graphId}`}
                            className="flex flex-col"
                          >
                            <span>{graph.graphName}</span>
                            <span className="font-mono text-xs text-zinc-500">
                              {graph.graphId}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {repositories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                        Shared repositories
                      </p>
                      {repositories.map((graph) => (
                        <div
                          key={graph.graphId}
                          className="flex items-center gap-2"
                        >
                          <Radio
                            id={`graph-${graph.graphId}`}
                            name="graph"
                            value={graph.graphId}
                            checked={selectedGraphId === graph.graphId}
                            onChange={() => setSelectedGraphId(graph.graphId)}
                          />
                          <Label
                            htmlFor={`graph-${graph.graphId}`}
                            className="flex flex-col"
                          >
                            <span>{graph.graphName}</span>
                            <span className="font-mono text-xs text-zinc-500">
                              {graph.graphId}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>
              )}
            </section>

            <Destination pending={pending} />

            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <Button
                color="gray"
                onClick={() => decide(false)}
                disabled={submitting !== null}
                data-testid="deny"
              >
                Cancel
              </Button>
              <Button
                onClick={() => decide(true)}
                disabled={submitting !== null || !selectedGraphId}
                data-testid="approve"
              >
                <HiShieldCheck className="mr-2 h-4 w-4" aria-hidden />
                {submitting === 'approve' ? 'Connecting…' : 'Allow access'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  )
}
