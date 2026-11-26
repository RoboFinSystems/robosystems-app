'use client'

import { CopyableId } from '@/components/CopyableId'
import { GuideLink } from '@/components/docs/GuideLink'
import { McpClientTabs, McpSnippet } from '@/components/mcp/McpSnippets'
import {
  connectorNameFor,
  MCP_API_URL,
  MCP_CONNECTOR_NAME,
  MCP_OAUTH_URL,
  MCP_ROBOLEDGER_CONNECTOR_NAME,
  MCP_ROBOLEDGER_URL,
  mcpEndpointFor,
  parentGraphIdOf,
  servesRoboLedgerMcp,
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
import { Badge, Card, Label, Radio, Select } from '@robosystems/core/ui'
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
 * What a connection can *do* follows the graph it reaches. Schema and query
 * tools come with every graph; each schema extension installed on the graph
 * adds its application's tools to that same connection, so no second URL, key,
 * or sign-in is needed. (`/v1/mcp/roboledger` is a narrower profile for chat
 * clients, not a requirement.) Names mirror the
 * extension catalog the API serves (`getAvailableExtensions`); the MCP server
 * gates the tools on the same `schemaExtensions` shown here.
 */
const EXTENSION_APPS: Record<string, { name: string; does: string }> = {
  roboledger: {
    name: 'RoboLedger',
    does: 'journal entries, period close, and live financial statements',
  },
  roboinvestor: {
    name: 'RoboInvestor',
    does: 'portfolio positions and the securities registry',
  },
}

/**
 * One line naming what the selected graph's connection carries beyond the
 * core tools. Silent on a graph with no application schema — there is nothing
 * to add, and this page has enough prose without a sentence that says so.
 * Shared repositories are read-only whatever they run, so they get the
 * read-side phrasing rather than the write-side tool list.
 */
function ConnectionScope({
  extensions,
  isRepository,
}: {
  extensions: string[]
  isRepository: boolean
}) {
  const apps = extensions
    .map((extension) => EXTENSION_APPS[extension])
    .filter((app): app is { name: string; does: string } => Boolean(app))

  if (apps.length === 0) return null

  const names = apps.map((app) => app.name).join(' and ')

  // A repository carries a product's schema for its read tools, but it is not
  // a RoboLedger graph (`/v1/mcp/roboledger` refuses it), so it isn't named.
  if (isRepository)
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        A shared repository is read-only, so this connection carries its
        statement, analysis, and query tools without the write tools.
      </p>
    )

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Runs <span className="font-medium">{names}</span>, so this same connection
      also drives {apps.map((app) => app.does).join(', plus ')}.
    </p>
  )
}

/**
 * What a sign-in connection reaches. `any` is the graph-agnostic address (the
 * graph is chosen on the consent screen), `workspace` pins the connection to
 * one graph or subgraph by putting its id in the URL, and `roboledger` is the
 * narrower address the RoboLedger directory listings carry.
 */
type Reach = 'any' | 'workspace' | 'roboledger'

/** The package and connector name of the local bridge. */
const BRIDGE_PACKAGE = '@robosystems/mcp@latest'
const BRIDGE_NAME = 'robosystems-bridge'

/**
 * The bridge talks to the hosted API unless told otherwise, so on a stack
 * someone runs themselves the snippets have to carry its address.
 */
const BRIDGE_API_URL =
  MCP_API_URL === 'https://api.robosystems.ai' ? null : MCP_API_URL

function ConnectWorkspace() {
  const { state: graphState } = useGraphContext()
  const { graphs, currentGraphId, isLoading } = graphState
  const searchParams = useSearchParams()

  const currentGraph = graphs.find((g) => g.graphId === currentGraphId)
  const hasRoboLedgerGraph = graphs.some(servesRoboLedgerMcp)
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

  // A deep link asks for one workspace, so the page opens pinned to it.
  const [reach, setReach] = useState<Reach>(
    requestedRef.current ? 'workspace' : 'any'
  )

  useEffect(() => {
    if (!currentGraphId) {
      setWorkspaceId(null)
      return
    }
    const requested = requestedRef.current
    requestedRef.current = null
    const inFamily =
      requested !== null && parentGraphIdOf(requested) === currentGraphId
    setWorkspaceId(inFamily ? requested : currentGraphId)
    // A deep link to some other graph's workspace pins nothing.
    if (requested !== null && !inFamily) setReach('any')
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
          ? `MCP connector - ${currentGraph.graphName} / ${workspace.label}`
          : `MCP connector - ${currentGraph.graphName}`,
      })
      setConnector(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate connector key')
    } finally {
      setIsGenerating(false)
    }
  }

  const workspaceUrl = workspace ? mcpEndpointFor(workspace.id) : ''
  const workspaceName = workspace ? connectorNameFor(workspace.id) : ''
  const keyValue = activeConnector?.apiKey ?? '<your key>'

  // The RoboLedger address refuses a repository at consent, so it is not
  // offered beside one; and a workspace can only be pinned once one exists.
  const offersRoboLedger = hasRoboLedgerGraph && !isRepository
  const effectiveReach: Reach =
    (reach === 'workspace' && !workspace) ||
    (reach === 'roboledger' && !offersRoboLedger)
      ? 'any'
      : reach

  const signIn =
    effectiveReach === 'workspace'
      ? { url: workspaceUrl, name: workspaceName }
      : effectiveReach === 'roboledger'
        ? { url: MCP_ROBOLEDGER_URL, name: MCP_ROBOLEDGER_CONNECTOR_NAME }
        : { url: MCP_OAUTH_URL, name: MCP_CONNECTOR_NAME }

  // A key made on this page is scoped to one workspace and cannot list the
  // account, so the bridge has to be told which graph it is for. An account
  // key from Settings needs no such line and reaches every graph.
  const bridgeScope = activeConnector ? activeConnector.graphId : null
  const bridgeCommand = [
    `claude mcp add ${BRIDGE_NAME}`,
    `  -e ROBOSYSTEMS_API_KEY=${keyValue}`,
    ...(bridgeScope ? [`  -e ROBOSYSTEMS_GRAPH_IDS=${bridgeScope}`] : []),
    ...(BRIDGE_API_URL ? [`  -e ROBOSYSTEMS_API_URL=${BRIDGE_API_URL}`] : []),
    `  -- npx -y ${BRIDGE_PACKAGE}`,
  ].join(' \\\n')
  const bridgeEnv = [
    `"ROBOSYSTEMS_API_KEY": "${keyValue}"`,
    ...(bridgeScope ? [`"ROBOSYSTEMS_GRAPH_IDS": "${bridgeScope}"`] : []),
    ...(BRIDGE_API_URL ? [`"ROBOSYSTEMS_API_URL": "${BRIDGE_API_URL}"`] : []),
  ]
  const bridgeConfig = `"${BRIDGE_NAME}": {
  "command": "npx",
  "args": ["-y", "${BRIDGE_PACKAGE}"],
  "env": {
${bridgeEnv.map((line) => `    ${line}`).join(',\n')}
  }
}`

  return (
    <PageLayout>
      <PageHeader
        icon={HiPuzzle}
        title="MCP"
        subtitle={
          <>
            Connect Claude, ChatGPT, Claude Code, Cursor or any MCP client to
            your graphs. Most people need only the first card.{' '}
            <GuideLink href="/docs/guides/connect-an-mcp-client" />
          </>
        }
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
          <Card>
            <section className="space-y-5" data-testid="connect-section">
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Connect your assistant
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Paste one address into your AI client and sign in to
                  RoboSystems. There is nothing to install and no key to store,
                  and access follows the role you already have. A graph running
                  RoboLedger or RoboInvestor brings that application&apos;s
                  tools along on the same connection.
                </p>
              </div>

              <fieldset className="space-y-3" data-testid="reach-options">
                <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  What should it reach?
                </legend>

                <div className="flex items-start gap-2">
                  <Radio
                    id="mcp-reach-any"
                    name="mcp-reach"
                    className="mt-0.5"
                    checked={effectiveReach === 'any'}
                    onChange={() => setReach('any')}
                  />
                  <Label htmlFor="mcp-reach-any" className="text-sm">
                    Any graph, chosen when you sign in
                    <span className="block font-normal text-zinc-500 dark:text-zinc-500">
                      Recommended. The sign-in screen lists your graphs and
                      shared repositories, and you pick one.
                    </span>
                  </Label>
                </div>

                {workspace && currentGraph && (
                  <div className="flex items-start gap-2">
                    <Radio
                      id="mcp-reach-workspace"
                      name="mcp-reach"
                      className="mt-0.5"
                      checked={effectiveReach === 'workspace'}
                      onChange={() => setReach('workspace')}
                    />
                    <Label htmlFor="mcp-reach-workspace" className="text-sm">
                      Only {workspace.label}
                      <span className="block font-normal text-zinc-500 dark:text-zinc-500">
                        For a subgraph, or to keep several graphs connected in
                        one client: each gets its own connection.
                      </span>
                    </Label>
                  </div>
                )}

                {offersRoboLedger && (
                  <div className="flex items-start gap-2">
                    <Radio
                      id="mcp-reach-roboledger"
                      name="mcp-reach"
                      className="mt-0.5"
                      checked={effectiveReach === 'roboledger'}
                      onChange={() => setReach('roboledger')}
                    />
                    <Label htmlFor="mcp-reach-roboledger" className="text-sm">
                      RoboLedger graphs only
                      <span className="block font-normal text-zinc-500 dark:text-zinc-500">
                        The ledger and close tools, without subgraph, backup or
                        other administration tools.
                      </span>
                    </Label>
                  </div>
                )}
              </fieldset>

              {effectiveReach === 'workspace' && workspace && currentGraph && (
                <div
                  className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  data-testid="workspace-target"
                >
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

                  <ConnectionScope
                    extensions={currentGraph.schemaExtensions ?? []}
                    isRepository={isRepository}
                  />

                  {workspaces.length > 1 && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="mcp-workspace"
                        className="text-sm font-medium"
                      >
                        Graph or subgraph
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
                    </div>
                  )}
                </div>
              )}

              <McpClientTabs
                url={signIn.url}
                name={signIn.name}
                namesSecListing={effectiveReach === 'any'}
              />

              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {effectiveReach === 'any' &&
                  'One connection reaches one graph: the one you pick at sign-in. To switch, disconnect in your client and sign in again.'}
                {effectiveReach === 'workspace' &&
                  'The graph is part of this address, so the connection can only ever reach it. The sign-in screen shows it already selected.'}
                {effectiveReach === 'roboledger' &&
                  'The sign-in screen offers only your own graphs running RoboLedger, never a subgraph or a shared repository.'}{' '}
                These addresses take a sign-in only; an API key is for the
                developer routes below.
              </p>
            </section>
          </Card>

          <Card>
            <section className="space-y-6" data-testid="developer-section">
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  For developers
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Two routes use an API key instead of a sign-in: a local bridge
                  that reaches every graph through one connection, and a
                  graph&apos;s own address for scripts and CI.
                </p>
              </div>

              {activeConnector && (
                <p
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
                  data-testid="key-notice"
                >
                  The snippets in this card now contain a live API key. Treat
                  anything you copy from them as a secret.
                </p>
              )}

              <section className="space-y-4" data-testid="bridge-section">
                <div className="space-y-1">
                  <h4 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    One connection for every graph
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    The RoboSystems bridge runs beside a local client such as
                    Claude Code, Claude Desktop, Cursor or VS Code. Your
                    assistant lists your graphs, looks up any graph&apos;s tools
                    and calls them, naming the graph each time, and a subgraph
                    is usable the moment it is created. It needs Node.js 22 or
                    later and does not work in claude.ai or ChatGPT.{' '}
                    <GuideLink
                      href="/docs/technical/the-mcp-bridge"
                      label="Bridge reference"
                    />
                  </p>
                </div>

                <McpSnippet
                  heading="Claude Code"
                  copyLabel="bridge command"
                  code={bridgeCommand}
                  note={
                    <>
                      Adds the bridge to the current project. Add{' '}
                      <code>--scope user</code> to have it in every project.
                    </>
                  }
                />

                <McpSnippet
                  heading="Claude Desktop, Cursor (mcpServers entry)"
                  copyLabel="bridge configuration"
                  code={bridgeConfig}
                  note={
                    bridgeScope ? (
                      <>
                        The key generated below is scoped to{' '}
                        <code className="break-all">{bridgeScope}</code>, so the
                        bridge is told which graph it is for. It reaches that
                        graph and its subgraphs.
                      </>
                    ) : (
                      <>
                        Use an account key from{' '}
                        <Link href="/settings" className="underline">
                          Settings → API Keys
                        </Link>{' '}
                        to reach every graph you can access
                        {workspace
                          ? `, or generate a key for ${workspace.label} under Scripts and CI below and these snippets fill in.`
                          : '.'}
                      </>
                    )
                  }
                />
              </section>

              {!currentGraph || !workspace ? (
                <EmptyState
                  icon={HiLink}
                  title="No graph selected"
                  description="Select a graph from the switcher above to connect it by its own address or to generate a key for it."
                />
              ) : (
                <details
                  className="group rounded-lg border border-zinc-200 dark:border-zinc-800"
                  data-testid="api-key-section"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-900 select-none dark:text-zinc-100">
                    Scripts and CI — {workspace.label}&apos;s own address with
                    an API key
                  </summary>
                  <div className="space-y-4 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Generate a key scoped to{' '}
                        <span className="font-medium">{workspace.label}</span>{' '}
                        and every snippet in this card is filled in, ready to
                        copy. The key goes in the <code>X-API-Key</code> header
                        — never in the URL — and is revocable anytime in{' '}
                        <Link href="/settings" className="underline">
                          Settings → API Keys
                        </Link>
                        . To change the graph or subgraph, choose it under
                        &ldquo;Only {workspace.label}&rdquo; above.
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
                      code={`claude mcp add --transport http ${workspaceName} \\
  ${workspaceUrl} \\
  --header "X-API-Key: ${keyValue}"`}
                    />

                    <McpSnippet
                      heading="Cursor / VS Code (mcp.json)"
                      copyLabel="mcp.json entry"
                      code={`"${workspaceName}": {
  "url": "${workspaceUrl}",
  "headers": { "X-API-Key": "${keyValue}" }
}`}
                    />
                  </div>
                </details>
              )}
            </section>
          </Card>
        </>
      )}

      <Card>
        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Notes
          </h3>
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              A sign-in grant is bound to the address it was issued for and to
              the client that asked. Disconnect in the client to end it;
              changing your password ends every grant at once.
            </li>
            <li>
              A key scoped to a parent graph also covers that graph&apos;s
              subgraphs. A key scoped to a subgraph reaches only that subgraph.
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
