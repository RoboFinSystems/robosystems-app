'use client'

import { GuideLink } from '@/components/docs/GuideLink'
import { McpSnippet } from '@/components/mcp/McpSnippets'
import {
  connectorNameFor,
  MCP_API_URL,
  MCP_CONNECTOR_NAME,
  MCP_GRAPHS_CONNECTOR_NAME,
  MCP_GRAPHS_URL,
  MCP_OAUTH_URL,
  MCP_ROBOLEDGER_CONNECTOR_NAME,
  MCP_ROBOLEDGER_URL,
  mcpEndpointFor,
  parentGraphIdOf,
  servesRoboLedgerMcp,
} from '@/lib/mcp'
import { CHATGPT_PLUGIN_URL, CLAUDE_CONNECTOR_URL } from '@/lib/site'
import { createUserApiKey, listSubgraphs } from '@robosystems/client'
import {
  createMcpConnectorUrl,
  PageHeader,
  PageLayout,
  useGraphContext,
} from '@robosystems/core'
import { Card, Checkbox, Label, Select, Tabs } from '@robosystems/core/ui'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { HiExternalLink, HiPuzzle, HiSparkles } from 'react-icons/hi'

/**
 * The ways in. Each is one card at the top and one panel below. The directory
 * card is offered only for a graph that has a listing.
 */
type Way = 'directory' | 'signin' | 'key'

const WAYS: { id: Way; title: string; blurb: string }[] = [
  {
    id: 'directory',
    title: 'Install from a directory',
    blurb: 'Nothing to set up.',
  },
  {
    id: 'signin',
    title: 'Sign in to one graph',
    blurb: 'Any client, including claude.ai and ChatGPT.',
  },
  {
    id: 'key',
    title: 'All your graphs, with an API key',
    blurb: 'Claude Code, Cursor, VS Code and scripts.',
  },
]

/**
 * Listings in a client's own directory. A listing needs no address and no
 * key: the client installs it and asks for a RoboSystems sign-in. Each is
 * shown for the graphs it reaches. Add a row when a listing is approved; the
 * page lays out whatever is here.
 */
interface ListedGraph {
  graphId: string
  isRepository?: boolean
}

const isSecRepository = (graph: ListedGraph) => graph.graphId === 'sec'

const DIRECTORY_LISTINGS: {
  reaches: string
  client: string
  listing: string
  href: string
  serves: (graph: ListedGraph) => boolean
}[] = [
  {
    reaches: 'SEC filings',
    client: 'Claude',
    listing: 'RoboSystems SEC',
    href: CLAUDE_CONNECTOR_URL,
    serves: isSecRepository,
  },
  {
    reaches: 'SEC filings',
    client: 'ChatGPT',
    listing: 'RoboSystems',
    href: CHATGPT_PLUGIN_URL,
    serves: isSecRepository,
  },
]

/** A graph or one of its subgraphs: the id is the whole address. */
interface Workspace {
  id: string
  label: string
  isSubgraph: boolean
}

const ANY = 'any'
const ROBOLEDGER = 'roboledger'
const ALL = 'all'
const KEY_PLACEHOLDER = '<your key>'

/** The bridge, for a client that cannot send a request header. */
const BRIDGE_PACKAGE = '@robosystems/mcp@latest'
const SELF_HOSTED_API_URL =
  MCP_API_URL === 'https://api.robosystems.ai' ? null : MCP_API_URL

function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h4 className="font-heading flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <span className="bg-primary-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
          {number}
        </span>
        {title}
      </h4>
      {children}
    </section>
  )
}

function ConnectWorkspace() {
  const { state: graphState } = useGraphContext()
  const { graphs, currentGraphId, isLoading } = graphState
  const searchParams = useSearchParams()

  const currentGraph = graphs.find((g) => g.graphId === currentGraphId)
  const isRepository = currentGraph?.isRepository ?? false
  const offersRoboLedger = graphs.some(servesRoboLedgerMcp)

  // `?workspace=<id>` is how the Subgraphs page hands a target over: the page
  // opens on a sign-in pinned to it.
  const requestedRef = useRef(searchParams.get('workspace'))

  // The card someone picked. Until they pick, a graph with a listing opens
  // on the directory, since that needs no setup, and any other on sign-in.
  const [chosenWay, setWay] = useState<Way | null>(
    requestedRef.current ? 'signin' : null
  )
  const [signInReach, setSignInReach] = useState<string>(
    requestedRef.current ?? ANY
  )
  const [keyReach, setKeyReach] = useState<string>(ALL)
  const [readOnly, setReadOnly] = useState(false)
  const [subgraphs, setSubgraphs] = useState<Workspace[]>([])
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentGraphId || isRepository) {
      setSubgraphs([])
      return
    }
    let cancelled = false
    listSubgraphs({ path: { graph_id: currentGraphId } })
      .then((response) => {
        if (cancelled) return
        setSubgraphs(
          (response.data?.subgraphs ?? []).map((subgraph) => ({
            id: subgraph.graph_id,
            label: subgraph.display_name,
            isSubgraph: true,
          }))
        )
      })
      .catch(() => {
        // Subgraphs only add options; a graph without them offers itself.
        if (!cancelled) setSubgraphs([])
      })
    return () => {
      cancelled = true
    }
  }, [currentGraphId, isRepository])

  const listings = currentGraph
    ? DIRECTORY_LISTINGS.filter((listing) => listing.serves(currentGraph))
    : []
  const ways = WAYS.filter(
    (option) => option.id !== 'directory' || listings.length > 0
  )
  const way: Way =
    chosenWay && ways.some((option) => option.id === chosenWay)
      ? chosenWay
      : listings.length > 0
        ? 'directory'
        : 'signin'

  const requested = requestedRef.current
  const workspaces: Workspace[] = currentGraph
    ? [
        {
          id: currentGraph.graphId,
          label: currentGraph.graphName,
          isSubgraph: false,
        },
        ...subgraphs,
        // A deep-linked subgraph is addressable before the list returns.
        ...(requested &&
        requested !== currentGraph.graphId &&
        parentGraphIdOf(requested) === currentGraph.graphId &&
        !subgraphs.some((s) => s.id === requested)
          ? [
              {
                id: requested,
                label: requested.slice(currentGraph.graphId.length + 1),
                isSubgraph: true,
              },
            ]
          : []),
      ]
    : []
  const workspaceLabel = (w: Workspace) =>
    w.isSubgraph && currentGraph
      ? `${currentGraph.graphName} / ${w.label}`
      : w.label

  // A selection that no longer names a listed workspace (the graph switched)
  // falls back to the lane's default instead of addressing a stale id.
  const pinned = (reach: string) => workspaces.find((w) => w.id === reach)
  const signInTarget =
    signInReach === ROBOLEDGER && offersRoboLedger
      ? { url: MCP_ROBOLEDGER_URL, name: MCP_ROBOLEDGER_CONNECTOR_NAME }
      : pinned(signInReach)
        ? {
            url: mcpEndpointFor(signInReach),
            name: connectorNameFor(signInReach),
          }
        : { url: MCP_OAUTH_URL, name: MCP_CONNECTOR_NAME }
  const signInValue =
    signInTarget.url === MCP_OAUTH_URL
      ? ANY
      : signInTarget.url === MCP_ROBOLEDGER_URL
        ? ROBOLEDGER
        : signInReach

  const keyWorkspace = pinned(keyReach)
  const keyValue = keyWorkspace ? keyReach : ALL
  const key = keys[keyValue] ?? KEY_PLACEHOLDER
  const keyTarget = keyWorkspace
    ? { url: mcpEndpointFor(keyWorkspace.id), name: connectorNameFor(keyValue) }
    : {
        url: readOnly ? `${MCP_GRAPHS_URL}?read_only=true` : MCP_GRAPHS_URL,
        name: MCP_GRAPHS_CONNECTOR_NAME,
      }

  const generate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      let created: string
      if (keyWorkspace) {
        const connector = await createMcpConnectorUrl(keyWorkspace.id, {
          apiUrl: MCP_API_URL,
          name: `MCP - ${workspaceLabel(keyWorkspace)}`,
        })
        created = connector.apiKey
      } else {
        const response = await createUserApiKey({
          body: { name: 'MCP - all graphs' },
        })
        if (response.error || !response.data) throw new Error()
        created = response.data.key
      }
      setKeys((held) => ({ ...held, [keyValue]: created }))
    } catch {
      setError('Could not create a key. Try again, or create one in Settings.')
    } finally {
      setIsGenerating(false)
    }
  }

  const bridgeEnv = [
    `"ROBOSYSTEMS_API_KEY": "${key}"`,
    ...(keyWorkspace ? [`"ROBOSYSTEMS_GRAPH_ID": "${keyWorkspace.id}"`] : []),
    ...(!keyWorkspace && readOnly ? ['"ROBOSYSTEMS_READ_ONLY": "true"'] : []),
    ...(SELF_HOSTED_API_URL
      ? [`"ROBOSYSTEMS_API_URL": "${SELF_HOSTED_API_URL}"`]
      : []),
  ]

  return (
    <PageLayout>
      <PageHeader
        icon={HiPuzzle}
        title="MCP"
        subtitle={
          <>
            Connect an AI client to your graphs.{' '}
            <GuideLink href="/docs/guides/connect-an-mcp-client" />
          </>
        }
      />

      <div
        className={`grid gap-3 ${ways.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
        role="radiogroup"
        aria-label="How to connect"
      >
        {ways.map((option) => {
          const selected = way === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`way-${option.id}`}
              onClick={() => setWay(option.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                selected
                  ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-950'
                  : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600'
              }`}
            >
              <span className="font-heading block font-semibold text-zinc-900 dark:text-zinc-100">
                {option.title}
              </span>
              <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                {option.id === 'directory' && listings.length > 0
                  ? `${listings[0].reaches} in ${listings.map((l) => l.client).join(' or ')}. ${option.blurb}`
                  : option.blurb}
              </span>
            </button>
          )
        })}
      </div>

      {way === 'directory' && (
        <Card>
          <div className="space-y-4" data-testid="directory-panel">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {listings.map((listing) => (
                <li
                  key={listing.href}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.reaches} in {listing.client}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Listed as {listing.listing}
                    </p>
                  </div>
                  <a
                    href={listing.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
                  >
                    Open in {listing.client}
                    <HiExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Install it, then sign in with your RoboSystems account when the
              client asks.
            </p>
          </div>
        </Card>
      )}

      {way === 'signin' && (
        <Card>
          <div className="space-y-6" data-testid="signin-panel">
            <Step number={1} title="Choose what it reaches">
              <Select
                id="signin-reach"
                aria-label="What the sign-in reaches"
                value={signInValue}
                onChange={(e) => setSignInReach(e.target.value)}
              >
                <option value={ANY}>A graph you pick when you sign in</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    Only {workspaceLabel(w)}
                  </option>
                ))}
                {offersRoboLedger && (
                  <option value={ROBOLEDGER}>
                    A RoboLedger graph, ledger tools only
                  </option>
                )}
              </Select>
            </Step>

            <Step number={2} title="Add it to your client">
              <Tabs aria-label="AI client" variant="underline">
                <Tabs.Item title="Claude">
                  <McpSnippet
                    heading="Customize → Connectors → Add custom connector"
                    copyLabel="connector address"
                    code={signInTarget.url}
                    note="Leave the OAuth fields blank. Claude opens the sign-in."
                  />
                </Tabs.Item>
                <Tabs.Item title="ChatGPT">
                  <McpSnippet
                    heading="Plugins → Add → Create custom MCP server"
                    copyLabel="connector address"
                    code={signInTarget.url}
                    note="Leave Authentication on OAuth. If the menu item is missing, turn on developer mode."
                  />
                </Tabs.Item>
                <Tabs.Item title="Claude Code">
                  <McpSnippet
                    heading="Run in a terminal"
                    copyLabel="Claude Code command"
                    code={`claude mcp add --transport http ${signInTarget.name} ${signInTarget.url}`}
                    note={
                      <>
                        Then run <code>/mcp</code> and sign in.
                      </>
                    }
                  />
                </Tabs.Item>
                <Tabs.Item title="Cursor">
                  <McpSnippet
                    heading="mcp.json, under mcpServers"
                    copyLabel="Cursor entry"
                    code={`"${signInTarget.name}": { "url": "${signInTarget.url}" }`}
                  />
                </Tabs.Item>
                <Tabs.Item title="VS Code">
                  <McpSnippet
                    heading="mcp.json, under servers"
                    copyLabel="VS Code entry"
                    code={`"${signInTarget.name}": { "type": "http", "url": "${signInTarget.url}" }`}
                  />
                </Tabs.Item>
              </Tabs>
            </Step>
          </div>
        </Card>
      )}

      {way === 'key' && (
        <Card>
          <div className="space-y-6" data-testid="key-panel">
            <Step number={1} title="Choose what it reaches">
              <Select
                id="key-reach"
                aria-label="What the key reaches"
                value={keyValue}
                onChange={(e) => setKeyReach(e.target.value)}
              >
                <option value={ALL}>
                  Every graph you can access, in one connection
                </option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    Only {workspaceLabel(w)}
                  </option>
                ))}
              </Select>
              {!keyWorkspace && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="key-read-only"
                    checked={readOnly}
                    onChange={(e) => setReadOnly(e.target.checked)}
                  />
                  <Label htmlFor="key-read-only" className="text-sm">
                    Read-only: no tool that changes a graph
                  </Label>
                </div>
              )}
            </Step>

            <Step number={2} title="Get a key">
              {keys[keyValue] ? (
                <p
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
                  data-testid="key-notice"
                >
                  Your key is in the snippets below and is shown only now. Treat
                  what you copy as a secret.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={isGenerating}
                    className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    <HiSparkles className="h-4 w-4" />
                    {isGenerating ? 'Generating…' : 'Generate key'}
                  </button>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    or use one from{' '}
                    <Link href="/settings" className="underline">
                      Settings → API Keys
                    </Link>
                  </p>
                </div>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </Step>

            <Step number={3} title="Add it to your client">
              <Tabs aria-label="AI client" variant="underline">
                <Tabs.Item title="Claude Code">
                  <McpSnippet
                    heading="Run in a terminal"
                    copyLabel="Claude Code command"
                    code={`claude mcp add --transport http ${keyTarget.name} \\
  ${keyTarget.url} \\
  --header "X-API-Key: ${key}"`}
                  />
                </Tabs.Item>
                <Tabs.Item title="Cursor">
                  <McpSnippet
                    heading="mcp.json, under mcpServers"
                    copyLabel="Cursor entry"
                    code={`"${keyTarget.name}": {
  "url": "${keyTarget.url}",
  "headers": { "X-API-Key": "${key}" }
}`}
                  />
                </Tabs.Item>
                <Tabs.Item title="VS Code">
                  <McpSnippet
                    heading="mcp.json, under servers"
                    copyLabel="VS Code entry"
                    code={`"${keyTarget.name}": {
  "type": "http",
  "url": "${keyTarget.url}",
  "headers": { "X-API-Key": "${key}" }
}`}
                  />
                </Tabs.Item>
                <Tabs.Item title="Claude Desktop">
                  <McpSnippet
                    heading="claude_desktop_config.json, under mcpServers"
                    copyLabel="Claude Desktop entry"
                    code={`"${keyTarget.name}": {
  "command": "npx",
  "args": ["-y", "${BRIDGE_PACKAGE}"],
  "env": {
${bridgeEnv.map((line) => `    ${line}`).join(',\n')}
  }
}`}
                    note="Claude Desktop cannot send a key itself, so it runs a small local program that does. Needs Node.js 22 or later."
                  />
                </Tabs.Item>
                <Tabs.Item title="Other">
                  <McpSnippet
                    heading="Address"
                    copyLabel="connection address"
                    code={keyTarget.url}
                    note={
                      <>
                        Send the key in the <code>X-API-Key</code> header, never
                        in the address.
                      </>
                    }
                  />
                </Tabs.Item>
              </Tabs>
            </Step>
          </div>
        </Card>
      )}

      {isLoading ? null : graphs.length === 0 && way !== 'directory' ? (
        <p
          className="text-sm text-zinc-600 dark:text-zinc-400"
          data-testid="no-graphs"
        >
          You have no graphs yet.{' '}
          <Link href="/graphs/new" className="underline">
            Create a graph
          </Link>{' '}
          or{' '}
          <Link href="/repositories/browse" className="underline">
            subscribe to a repository
          </Link>{' '}
          to have something to connect.
        </p>
      ) : null}
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
