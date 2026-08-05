'use client'

import type { GraphInfo } from '@robosystems/client'
import type { McpConnectorUrl } from '@robosystems/core'
import {
  createMcpConnectorUrl,
  EmptyState,
  PageHeader,
  PageLayout,
  useGraphContext,
} from '@robosystems/core'
import { Alert, Badge, Card } from 'flowbite-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  HiCheck,
  HiClipboardCopy,
  HiInformationCircle,
  HiLink,
  HiPuzzle,
  HiSparkles,
} from 'react-icons/hi'

const API_URL =
  process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'https://api.robosystems.ai'

/**
 * The graph id lives in the URL path and never becomes a tool argument, so a
 * connector is anchored to exactly one graph. That is why multi-graph users add
 * one connector per graph rather than picking a graph mid-conversation.
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
}: {
  heading: string
  code: string
  copyLabel: string
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
    </div>
  )
}

function ClaudeConnectorSection({ graph }: { graph: GraphInfo }) {
  const [connector, setConnector] = useState<McpConnectorUrl | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await createMcpConnectorUrl(graph.graphId, {
        apiUrl: API_URL,
        name: `Claude connector - ${graph.graphName}`,
      })
      setConnector(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate connector URL')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
          Claude (claude.ai / Desktop) — Settings → Connectors → Add custom
          connector
        </p>
        {!connector && (
          <button
            type="button"
            onClick={generate}
            disabled={isGenerating}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <HiSparkles className="h-3.5 w-3.5" />
            {isGenerating ? 'Generating…' : 'Generate connector URL'}
          </button>
        )}
      </div>
      {connector ? (
        <>
          <Snippet
            heading="Paste this URL into the connector dialog — no header needed"
            copyLabel="Connector URL"
            code={connector.url}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            The URL contains a key scoped to this graph only — treat it like a
            password. Revoke it anytime in{' '}
            <Link href="/settings" className="underline">
              Settings → API Keys
            </Link>
            .
          </p>
        </>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Claude&apos;s custom connectors can&apos;t send an API-key header, so
          the connector URL carries its own graph-scoped key. Generate one to
          get a pasteable URL.
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

function GraphConnectCard({
  graph,
  isCurrent,
}: {
  graph: GraphInfo
  isCurrent: boolean
}) {
  const url = mcpUrlFor(graph.graphId)
  const name = connectorNameFor(graph.graphId)

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {graph.graphName}
            </h3>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
              {graph.graphId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {graph.isRepository && <Badge color="purple">Repository</Badge>}
            {isCurrent && <Badge color="info">Selected</Badge>}
          </div>
        </div>

        <ClaudeConnectorSection graph={graph} />

        <Snippet
          heading="Claude Code"
          copyLabel="Claude Code command"
          code={`claude mcp add --transport http ${name} \\
  ${url} \\
  --header "X-API-Key: <your key>"`}
        />

        <Snippet
          heading="Cursor / VS Code (mcp.json)"
          copyLabel="mcp.json entry"
          code={`"${name}": {
  "url": "${url}",
  "headers": { "X-API-Key": "<your key>" }
}`}
        />
      </div>
    </Card>
  )
}

export function ConnectContent() {
  const { state: graphState } = useGraphContext()
  const { graphs, currentGraphId, isLoading } = graphState

  return (
    <PageLayout>
      <PageHeader
        icon={HiPuzzle}
        title="Connect"
        subtitle="Add your graphs to Claude, Claude Code, Cursor, or any MCP client — one URL, one header, no install."
      />

      <Alert color="info" icon={HiInformationCircle}>
        <span className="font-medium">
          Claude Code and Cursor need an API key
        </span>{' '}
        — create one in{' '}
        <Link href="/settings" className="font-medium underline">
          Settings
        </Link>{' '}
        and paste it as the <code>X-API-Key</code> header value; one
        account-wide key works for every graph below. For claude.ai / Claude
        Desktop, generate a connector URL on the graph&apos;s card instead — it
        carries its own graph-scoped key, no header needed.
      </Alert>

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
        <div className="space-y-6">
          {graphs.map((graph) => (
            <GraphConnectCard
              key={graph.graphId}
              graph={graph}
              isCurrent={graph.graphId === currentGraphId}
            />
          ))}
        </div>
      )}

      <Card>
        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Notes
          </h3>
          <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              One graph is one connector. The graph id is part of the URL, so a
              connector can only ever reach the graph you pointed it at.
            </li>
            <li>
              Subgraphs work the same way — swap the id in the URL for the
              subgraph id.
            </li>
            <li>
              A generated connector URL embeds a graph-scoped key: it works only
              for that graph, is rejected everywhere else, and is revocable in
              Settings → API Keys.
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
