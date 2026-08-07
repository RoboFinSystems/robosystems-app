'use client'

import { CopyableId, CopyButton } from '@/components/CopyableId'
import {
  connectorNameFor,
  MCP_API_URL,
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
 * citizens here — the id is the address, and everything on the page (URL, key
 * scope, connector name) is derived from the selected one.
 */
interface Workspace {
  id: string
  label: string
  isSubgraph: boolean
}

function Snippet({
  heading,
  code,
  copyLabel,
  note,
}: {
  heading: string
  code: string
  copyLabel: string
  note?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
          {heading}
        </p>
        <CopyButton value={code} label={copyLabel} />
      </div>
      <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300">
        <code>{code}</code>
      </pre>
      {note && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{note}</p>
      )}
    </div>
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
        subtitle="Add a graph or subgraph to Claude, Claude Code, Cursor, or any MCP client — pick the workspace, generate a key, and every snippet below is ready to paste."
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
      ) : !currentGraph || !workspace ? (
        <EmptyState
          icon={HiLink}
          title="No graph selected"
          description="Select a graph from the switcher above, then connect it here."
        />
      ) : (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {workspace.label}
                </h3>
                <CopyableId
                  value={workspace.id}
                  label={workspace.isSubgraph ? 'subgraph id' : 'graph id'}
                />
              </div>
              <div className="flex items-center gap-2">
                {currentGraph.isRepository && (
                  <Badge color="purple">Repository</Badge>
                )}
                {workspace.isSubgraph && <Badge color="indigo">Subgraph</Badge>}
                {!activeConnector && (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={isGenerating}
                    className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  >
                    <HiSparkles className="h-4 w-4" />
                    {isGenerating ? 'Generating…' : 'Generate connector key'}
                  </button>
                )}
              </div>
            </div>

            {workspaces.length > 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="mcp-workspace" className="text-sm font-medium">
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
                  One workspace is one connector. Every snippet below
                  re-addresses itself to the selection.
                </p>
              </div>
            )}

            {!activeConnector && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Generate a key scoped to this workspace and every snippet below
                is filled in, ready to copy. The key works only here and is
                revocable anytime in{' '}
                <Link href="/settings" className="underline">
                  Settings → API Keys
                </Link>
                .
              </p>
            )}
            {workspace.isSubgraph && !activeConnector && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Already have a connector for{' '}
                <span className="font-medium">{currentGraph.graphName}</span>?
                Its key covers this subgraph too — paste that same token into
                the snippets below instead of generating a second key.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            <Snippet
              heading="Claude (claude.ai / Desktop) — Settings → Connectors → Add custom connector"
              copyLabel="Connector URL"
              code={
                activeConnector
                  ? activeConnector.url
                  : `${url}?token=<generate a key first>`
              }
              note={
                activeConnector
                  ? 'Paste the whole URL — the key rides inside it, no header needed. Treat it like a password.'
                  : "Claude's connectors can't send headers, so the URL carries the key itself."
              }
            />

            <Snippet
              heading="Claude Code"
              copyLabel="Claude Code command"
              code={`claude mcp add --transport http ${name} \\
  ${url} \\
  --header "X-API-Key: ${keyValue}"`}
            />

            <Snippet
              heading="Cursor / VS Code (mcp.json)"
              copyLabel="mcp.json entry"
              code={`"${name}": {
  "url": "${url}",
  "headers": { "X-API-Key": "${keyValue}" }
}`}
            />
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Notes
          </h3>
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              One workspace is one connector. The id is part of the URL, so a
              connector can only ever reach the graph or subgraph you pointed it
              at — to connect another, change the selection and generate again.
            </li>
            <li>
              A key scoped to a parent graph also covers that graph's subgraphs,
              so one token can serve every connector in a graph family. A key
              scoped to a subgraph reaches only that subgraph.
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
