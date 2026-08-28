'use client'

import { CopyButton } from '@/components/CopyableId'
import type { ReactNode } from 'react'

/**
 * One client recipe: an uppercase heading, a copy button, the code, and an
 * optional note underneath.
 */
export function McpSnippet({
  heading,
  code,
  copyLabel,
  note,
}: {
  heading: string
  code: string
  copyLabel: string
  note?: ReactNode
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

/**
 * The three sign-in recipes for one MCP address. Every page that offers an
 * address renders this same set, so the universal URL and a workspace URL
 * read as the same kind of thing — only the address and connector name
 * differ.
 */
export function McpSignInSnippets({
  url,
  name,
}: {
  url: string
  name: string
}) {
  return (
    <>
      <McpSnippet
        heading="Claude (claude.ai / Desktop) — Settings → Connectors → Add custom connector"
        copyLabel="Connector URL"
        code={url}
        note="Claude detects the sign-in on its own. Leave the OAuth client fields blank."
      />

      <McpSnippet
        heading="Claude Code"
        copyLabel="Claude Code command"
        code={`claude mcp add --transport http ${name} ${url}`}
        note={
          <>
            Then run <code>/mcp</code>, pick{' '}
            <code className="break-all">{name}</code>, and sign in.
          </>
        }
      />

      <McpSnippet
        heading="Cursor / VS Code (mcp.json)"
        copyLabel="mcp.json entry"
        code={`"${name}": { "url": "${url}" }`}
        note="The editor opens the sign-in the first time it connects."
      />
    </>
  )
}
