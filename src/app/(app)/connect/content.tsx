'use client'

import type { McpConnectorUrl } from '@robosystems/core'
import {
  createMcpConnectorUrl,
  EmptyState,
  PageHeader,
  PageLayout,
  useGraphContext,
} from '@robosystems/core'
import { Badge, Card } from 'flowbite-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  HiCheck,
  HiClipboardCopy,
  HiLink,
  HiPuzzle,
  HiSparkles,
} from 'react-icons/hi'

const API_URL =
  process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'https://api.robosystems.ai'

/**
 * The graph id lives in the URL path and never becomes a tool argument, so a
 * connector is anchored to exactly one graph. The page follows the app's
 * selected graph; switch graphs to connect a different one.
 */
const mcpUrlFor = (graphId: string) => `${API_URL}/v1/graphs/${graphId}/mcp`

/** Connector names must be distinct per graph, so the id rides along. */
const connectorNameFor = (graphId: string) => `robosystems-${graphId}`

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied (insecure origin, permissions); the
      // snippet is selectable either way, so there is nothing to recover.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {copied ? (
        <>
          <HiCheck className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <HiClipboardCopy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  )
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

export function ConnectContent() {
  const { state: graphState } = useGraphContext()
  const { graphs, currentGraphId, isLoading } = graphState

  const currentGraph = graphs.find((g) => g.graphId === currentGraphId)

  const [connector, setConnector] = useState<McpConnectorUrl | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A generated key belongs to one graph; switching graphs resets the page to
  // placeholders rather than showing another graph's credential.
  const activeConnector =
    connector && connector.graphId === currentGraphId ? connector : null

  const generate = async () => {
    if (!currentGraph) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await createMcpConnectorUrl(currentGraph.graphId, {
        apiUrl: API_URL,
        name: `Claude connector - ${currentGraph.graphName}`,
      })
      setConnector(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate connector key')
    } finally {
      setIsGenerating(false)
    }
  }

  const url = currentGraph ? mcpUrlFor(currentGraph.graphId) : ''
  const name = currentGraph ? connectorNameFor(currentGraph.graphId) : ''
  const keyValue = activeConnector?.apiKey ?? '<your key>'

  return (
    <PageLayout>
      <PageHeader
        icon={HiPuzzle}
        title="Connect"
        subtitle="Add this graph to Claude, Claude Code, Cursor, or any MCP client — generate a key and every snippet below is ready to paste."
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
      ) : !currentGraph ? (
        <EmptyState
          icon={HiLink}
          title="No graph selected"
          description="Select a graph from the switcher above, then connect it here."
        />
      ) : (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentGraph.graphName}
                </h3>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
                  {currentGraph.graphId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentGraph.isRepository && (
                  <Badge color="purple">Repository</Badge>
                )}
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

            {!activeConnector && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Generate a key scoped to this graph and every snippet below is
                filled in, ready to copy. The key works only for this graph and
                is revocable anytime in{' '}
                <Link href="/settings" className="underline">
                  Settings → API Keys
                </Link>
                .
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
              One graph is one connector. The graph id is part of the URL, so a
              connector can only ever reach the graph you pointed it at — to
              connect another graph, switch graphs and generate again.
            </li>
            <li>
              Subgraphs work the same way — swap the id in the URL for the
              subgraph id.
            </li>
            <li>
              The generated key is graph-scoped: it works only for this graph,
              is rejected everywhere else, and is revocable in Settings → API
              Keys.
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
