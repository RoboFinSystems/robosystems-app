'use client'

import { CopyableId } from '@/components/CopyableId'
import { McpSignInSnippets, McpSnippet } from '@/components/mcp/McpSnippets'
import {
  connectorNameFor,
  MCP_API_URL,
  MCP_CONNECTOR_NAME,
  MCP_OAUTH_URL,
  mcpEndpointFor,
  parentGraphIdOf,
} from '@/lib/mcp'
import { listSubgraphs } from '@robosystems/client'
import type { McpConnectorUrl } from '@robosystems/core'
import {
  createMcpConnectorUrl,
  EmptyState,
  PageHeader,
  PageLayout,
  useGraphContext,
} from '@robosystems/core'
import { Badge, Card, Label, Select } from 'flowbite-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { HiLink, HiPuzzle, HiSparkles } from 'react-icons/hi'

/**
 * A connector target. The parent graph and each of its subgraphs are equal
 * citizens here — the id is the address, and everything in the workspace
 * section (URL, key scope, connector name) is derived from the selected one.
 */
interface Workspace {
  id: string
  label: string
  isSubgraph: boolean
}

/**
 * The graph-agnostic address. It is the one every public listing carries
 * (MCP registry, Claude directory, the bridge README), so it leads here too.
 * It takes only a sign-in — the consent screen is where the graph is chosen —
 * and a grant names exactly one graph, the same as a workspace URL.
 */
function UniversalSection() {
  return (
    <Card>
      <section className="space-y-4" data-testid="universal-section">
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Sign in and pick a graph
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            One address for every graph you can access. Paste it and the client
            sends you to RoboSystems to sign in; the consent screen lists your
            graphs and shared repositories, and you choose one. Access follows
            the role you already have, and each connection is one grant —
            nothing to copy, store, or rotate.
          </p>
        </div>

        <McpSignInSnippets url={MCP_OAUTH_URL} name={MCP_CONNECTOR_NAME} />

        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          A connection reaches one graph. To connect a subgraph, keep several
          graphs connected in one client, or use an API key, pin the connection
          to a workspace below.
        </p>
      </section>
    </Card>
  )
}

function ConnectWorkspace() {
  const { state: graphState } = useGraphContext()
  const { graphs, currentGraphId, isLoading } = graphState
  const searchParams = useSearchParams()

  const currentGraph = graphs.find((g) => g.graphId === currentGraphId)
  const isRepository = currentGraph?.isRepository ?? false

  const [subgraphs, setSubgraphs] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [connector, setConnector] = useState<McpConnectorUrl | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // `?workspace=<id>` is how the Subgraphs page hands a target over. It applies
  // to the first graph that resolves and is then spent, so a later re-render
  // (or a graph switch) can't yank the selector back to the deep-linked id.
  const requestedRef = useRef(searchParams.get('workspace'))

  useEffect(() => {
    if (!currentGraphId) {
      setWorkspaceId(null)
      return
    }
    const requested = requestedRef.current
    requestedRef.current = null
    setWorkspaceId(
      requested && parentGraphIdOf(requested) === currentGraphId
        ? requested
        : currentGraphId
    )
  }, [currentGraphId])

  useEffect(() => {
    if (!currentGraphId || isRepository) {
      setSubgraphs([])
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const response = await listSubgraphs({
          path: { graph_id: currentGraphId },
        })
        if (cancelled) return
        setSubgraphs(
          (response.data?.subgraphs ?? []).map((subgraph) => ({
            id: subgraph.graph_id,
            label: subgraph.display_name,
            isSubgraph: true,
          }))
        )
      } catch {
        // Subgraphs are a tier feature and the selector is purely additive —
        // a graph that has none (or a tier that can't) gets the parent alone.
        if (!cancelled) setSubgraphs([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentGraphId, isRepository])

  const workspaces: Workspace[] = currentGraph
    ? [
        {
          id: currentGraph.graphId,
          label: currentGraph.graphName,
          isSubgraph: false,
        },
        ...subgraphs,
      ]
    : []

  // A deep-linked subgraph is addressable before `listSubgraphs` returns — the
  // id already carries everything the snippets need, so don't make the page
  // wait on a round-trip to render the thing it was linked to.
  const pendingDeepLink =
    workspaceId &&
    currentGraph &&
    workspaceId !== currentGraph.graphId &&
    parentGraphIdOf(workspaceId) === currentGraph.graphId
      ? {
          id: workspaceId,
          label: workspaceId.slice(currentGraph.graphId.length + 1),
          isSubgraph: true,
        }
      : null

  const workspace =
    workspaces.find((w) => w.id === workspaceId) ??
    pendingDeepLink ??
    workspaces[0]

  // A generated key belongs to one workspace; switching resets the page to
  // placeholders rather than showing another workspace's credential.
  const activeConnector =
    connector && workspace && connector.graphId === workspace.id
      ? connector
      : null

  const generate = async () => {
    if (!workspace || !currentGraph) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await createMcpConnectorUrl(workspace.id, {
        apiUrl: MCP_API_URL,
        name: workspace.isSubgraph
          ? `Claude connector - ${currentGraph.graphName} / ${workspace.label}`
          : `Claude connector - ${currentGraph.graphName}`,
      })
      setConnector(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate connector key')
    } finally {
      setIsGenerating(false)
    }
  }

  const url = workspace ? mcpEndpointFor(workspace.id) : ''
  const name = workspace ? connectorNameFor(workspace.id) : ''
  const keyValue = activeConnector?.apiKey ?? '<your key>'

  return (
    <PageLayout>
      <PageHeader
        icon={HiPuzzle}
        title="MCP"
        subtitle="Add RoboSystems to Claude, Claude Code, Cursor, or any MCP client — paste one URL and pick the graph when you sign in, or pin a connection to one graph or subgraph."
      />

      {isLoading ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading your graphs...
          </p>
        </Card>
      ) : graphs.length === 0 ? (
        <EmptyState
          icon={HiLink}
          title="No graphs yet"
          description="Create a graph or subscribe to a repository, then come back to connect it to your AI client."
        />
      ) : (
        <>
          <UniversalSection />

          {!currentGraph || !workspace ? (
            <EmptyState
              icon={HiLink}
              title="No graph selected"
              description="Select a graph from the switcher above to pin a connection to it or to one of its subgraphs."
            />
          ) : (
            <Card>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Pin a connection to one workspace
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      The graph or subgraph id is part of the URL, so this
                      connection can only ever reach the workspace you point it
                      at. It is how a subgraph is connected, how one client
                      keeps several graphs connected at once, and the route that
                      takes an API key.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {workspace.label}
                      </p>
                      <CopyableId
                        value={workspace.id}
                        label={
                          workspace.isSubgraph ? 'subgraph id' : 'graph id'
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {currentGraph.isRepository && (
                        <Badge color="purple">Repository</Badge>
                      )}
                      {workspace.isSubgraph && (
                        <Badge color="indigo">Subgraph</Badge>
                      )}
                    </div>
                  </div>

                  {workspaces.length > 1 && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="mcp-workspace"
                        className="text-sm font-medium"
                      >
                        Workspace
                      </Label>
                      <Select
                        id="mcp-workspace"
                        value={workspace.id}
                        onChange={(e) => setWorkspaceId(e.target.value)}
                      >
                        {workspaces.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.isSubgraph
                              ? `${w.label} — subgraph`
                              : `${w.label} — parent graph`}
                          </option>
                        ))}
                      </Select>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        The parent graph and each of its subgraphs is its own
                        connection. Every snippet below re-addresses itself to
                        the selection.
                      </p>
                    </div>
                  )}
                </div>

                <section className="space-y-4" data-testid="oauth-section">
                  <div className="space-y-1">
                    <h4 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Sign in to connect
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Same sign-in as above, with this workspace already
                      selected on the consent screen.
                    </p>
                  </div>

                  <McpSignInSnippets url={url} name={name} />
                </section>

                <details
                  className="group rounded-lg border border-zinc-200 dark:border-zinc-800"
                  data-testid="api-key-section"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-900 select-none dark:text-zinc-100">
                    Use an API key instead — scripts, CI, and clients that
                    can&apos;t sign in
                  </summary>
                  <div className="space-y-4 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Generate a key scoped to this workspace and every
                        snippet below is filled in, ready to copy. The key goes
                        in the <code>X-API-Key</code> header — never in the URL
                        — works only here, and is revocable anytime in{' '}
                        <Link href="/settings" className="underline">
                          Settings → API Keys
                        </Link>
                        .
                      </p>
                      {!activeConnector && (
                        <button
                          type="button"
                          onClick={generate}
                          disabled={isGenerating}
                          className="bg-primary-600 hover:bg-primary-700 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                        >
                          <HiSparkles className="h-4 w-4" />
                          {isGenerating
                            ? 'Generating…'
                            : 'Generate connector key'}
                        </button>
                      )}
                    </div>
                    {workspace.isSubgraph && !activeConnector && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Already have a key for{' '}
                        <span className="font-medium">
                          {currentGraph.graphName}
                        </span>
                        ? It covers this subgraph too — paste that same token
                        into the snippets below instead of generating a second
                        key.
                      </p>
                    )}
                    {error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    )}

                    <McpSnippet
                      heading="Claude Code"
                      copyLabel="Claude Code command"
                      code={`claude mcp add --transport http ${name} \\
  ${url} \\
  --header "X-API-Key: ${keyValue}"`}
                    />

                    <McpSnippet
                      heading="Cursor / VS Code (mcp.json)"
                      copyLabel="mcp.json entry"
                      code={`"${name}": {
  "url": "${url}",
  "headers": { "X-API-Key": "${keyValue}" }
}`}
                    />
                  </div>
                </details>
              </div>
            </Card>
          )}
        </>
      )}

      <Card>
        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Notes
          </h3>
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              A connection reaches one graph. On the universal URL the grant
              names the graph you chose at sign-in — disconnect and sign in
              again to switch. On a workspace URL the id is part of the address,
              so one client can hold a connection per graph or subgraph.
            </li>
            <li>
              The universal URL takes only a sign-in; an API key is rejected
              there. Keys go with a workspace URL.
            </li>
            <li>
              A sign-in grant is bound to the URL it was issued for and to the
              client that asked. Disconnect in the client to end it; changing
              your password ends every grant at once.
            </li>
            <li>
              A key scoped to a parent graph also covers that graph&apos;s
              subgraphs, so one token can serve every connection in a graph
              family. A key scoped to a subgraph reaches only that subgraph.
            </li>
            <li>
              Generated keys are graph-scoped: rejected on every account-level
              surface, and revocable in Settings → API Keys.
            </li>
            <li>
              Clients without HTTP transport support can use the{' '}
              <a
                href="https://github.com/RoboFinSystems/robosystems-mcp-client"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                stdio bridge
              </a>{' '}
              in proxy mode.
            </li>
          </ul>
        </div>
      </Card>
    </PageLayout>
  )
}

export function ConnectContent() {
  // useSearchParams needs a Suspense boundary, or the whole route opts out of
  // static rendering.
  return (
    <Suspense fallback={null}>
      <ConnectWorkspace />
    </Suspense>
  )
}
