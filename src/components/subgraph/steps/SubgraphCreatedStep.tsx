'use client'

import { CopyButton } from '@/components/CopyableId'
import { mcpEndpointFor } from '@/lib/mcp'
import { customTheme } from '@robosystems/core/theme'
import { Card } from 'flowbite-react'
import { HiCheckCircle } from 'react-icons/hi'

interface SubgraphCreatedStepProps {
  subgraphId: string
  displayName: string
  parentGraphName?: string
}

/**
 * The wizard ends on the address, not on "created."
 *
 * MCP is URL-anchored, so the full subgraph id is the one artifact a user
 * cannot reconstruct or guess — and until this step existed, creation handed
 * back a subgraph the app never named.
 */
export function SubgraphCreatedStep({
  subgraphId,
  displayName,
  parentGraphName,
}: SubgraphCreatedStepProps) {
  const endpoint = mcpEndpointFor(subgraphId)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
          <HiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {displayName} is ready
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            An isolated, writable graph inside{' '}
            {parentGraphName || 'the parent graph'}.
          </p>
        </div>
      </div>

      <Card theme={customTheme.card}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Subgraph ID
              </p>
              <CopyButton value={subgraphId} label="subgraph id" />
            </div>
            <p className="rounded-lg bg-gray-100 p-3 font-mono text-sm break-all text-gray-900 dark:bg-zinc-900 dark:text-gray-100">
              {subgraphId}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use this wherever a graph id is asked for — API calls, the MCP
              connector URL, and scoped API keys.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                MCP endpoint
              </p>
              <CopyButton value={endpoint} label="MCP endpoint" />
            </div>
            <p className="overflow-x-auto rounded-lg bg-gray-100 p-3 font-mono text-sm break-all text-gray-900 dark:bg-zinc-900 dark:text-gray-100">
              {endpoint}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A connector is anchored to this URL. Continue to MCP for the
              ready-to-paste snippets and a key scoped to this subgraph — an
              existing key scoped to {parentGraphName || 'the parent graph'}{' '}
              already covers it too.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
