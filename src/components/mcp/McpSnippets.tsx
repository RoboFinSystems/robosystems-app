'use client'

import { CopyButton } from '@/components/CopyableId'
import { CHATGPT_PLUGIN_URL, CLAUDE_CONNECTOR_URL } from '@/lib/site'
import { Tabs } from '@robosystems/core/ui'
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
 * The sign-in recipes for one MCP address. Every page that offers an
 * address renders this same set, so the universal URL and a workspace URL
 * read as the same kind of thing — only the address and connector name
 * differ (and the client notes, where the SEC listing they name is the wrong
 * one).
 */
export function McpSignInSnippets({
  url,
  name,
  claudeNote,
  chatgptNote,
}: {
  url: string
  name: string
  claudeNote?: ReactNode
  chatgptNote?: ReactNode
}) {
  return (
    <>
      <McpSnippet
        heading="Claude (claude.ai / Desktop) — Customize → Connectors → Add custom connector"
        copyLabel="Connector URL"
        code={url}
        note={
          claudeNote ?? (
            <>
              Claude detects the sign-in on its own. Leave the OAuth client
              fields blank. For SEC filings alone, add{' '}
              <a
                href={CLAUDE_CONNECTOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                RoboSystems SEC
              </a>{' '}
              from Claude&apos;s connector directory instead.
            </>
          )
        }
      />

      <McpSnippet
        heading="ChatGPT — developer mode, then create an app"
        copyLabel="Connector URL"
        code={url}
        note={
          chatgptNote ?? (
            <>
              A custom connector serves every tool of the graph you pick,
              RoboLedger included. Or install the{' '}
              <a
                href={CHATGPT_PLUGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                RoboSystems plugin
              </a>{' '}
              from the ChatGPT plugin directory — no setup, the SEC filings read
              surface.
            </>
          )
        }
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

const linkClass = 'text-primary-600 dark:text-primary-400 hover:underline'

/**
 * The same sign-in recipes as `McpSignInSnippets`, one client at a time. The
 * MCP page shows a single address, so a reader picks their client and sees
 * one thing to copy instead of four. `namesSecListing` is off wherever the
 * directory listings would be the wrong thing to point at.
 */
export function McpClientTabs({
  url,
  name,
  namesSecListing = true,
}: {
  url: string
  name: string
  namesSecListing?: boolean
}) {
  return (
    <Tabs aria-label="AI client" variant="underline">
      <Tabs.Item title="Claude">
        <McpSnippet
          heading="claude.ai / Desktop — Customize → Connectors → Add custom connector"
          copyLabel="Connector URL"
          code={url}
          note={
            <>
              Claude detects the sign-in on its own. Leave the OAuth client
              fields blank.
              {namesSecListing && (
                <>
                  {' '}
                  For SEC filings alone, add{' '}
                  <a
                    href={CLAUDE_CONNECTOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    RoboSystems SEC
                  </a>{' '}
                  from Claude&apos;s connector directory instead: nothing to
                  paste.
                </>
              )}
            </>
          }
        />
      </Tabs.Item>

      <Tabs.Item title="ChatGPT">
        <McpSnippet
          heading="Plugins → Add → Create custom MCP server"
          copyLabel="Connector URL"
          code={url}
          note={
            <>
              Leave Authentication on OAuth. If the menu item is missing, turn
              on developer mode in ChatGPT&apos;s settings.
              {namesSecListing && (
                <>
                  {' '}
                  For SEC filings alone, install the{' '}
                  <a
                    href={CHATGPT_PLUGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    RoboSystems plugin
                  </a>{' '}
                  from the ChatGPT plugin directory instead: nothing to paste.
                </>
              )}
            </>
          }
        />
      </Tabs.Item>

      <Tabs.Item title="Claude Code">
        <McpSnippet
          heading="Run in a terminal"
          copyLabel="Claude Code command"
          code={`claude mcp add --transport http ${name} ${url}`}
          note={
            <>
              Then run <code>/mcp</code>, pick{' '}
              <code className="break-all">{name}</code>, and sign in.
            </>
          }
        />
      </Tabs.Item>

      <Tabs.Item title="Cursor / VS Code">
        <div className="space-y-4">
          <McpSnippet
            heading="Cursor — under mcpServers"
            copyLabel="Cursor entry"
            code={`"${name}": { "url": "${url}" }`}
          />
          <McpSnippet
            heading="VS Code — mcp.json, under servers"
            copyLabel="VS Code entry"
            code={`"${name}": { "type": "http", "url": "${url}" }`}
            note="The editor opens the sign-in the first time it connects."
          />
        </div>
      </Tabs.Item>
    </Tabs>
  )
}
