'use client'

import { useState } from 'react'
import { HiCheck, HiClipboardCopy } from 'react-icons/hi'

function useCopy(value: string) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied (insecure origin, permissions); the
      // value is selectable either way, so there is nothing to recover.
    }
  }

  return { copied, copy }
}

/** A bordered "Copy" button for a snippet or field, labeled for screen readers. */
export function CopyButton({
  value,
  label,
  className = '',
}: {
  value: string
  label: string
  className?: string
}) {
  const { copied, copy } = useCopy(value)

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 ${className}`}
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

/**
 * An identifier rendered as visible, selectable mono text that copies on click.
 *
 * Graph and subgraph ids are addresses — they go into MCP connector URLs and
 * API calls — so they belong on screen rather than in a `title` tooltip, and
 * they are shown whole. An ellipsis would save a couple of characters on a
 * ~22-character id while making it unverifiable at a glance, so a long id
 * (a subgraph's, in a narrow column) wraps rather than truncating.
 */
export function CopyableId({
  value,
  label,
  className = '',
}: {
  value: string
  label: string
  className?: string
}) {
  const { copied, copy } = useCopy(value)

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}: ${value}`}
      className={`group -mx-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
    >
      <span className="break-all">{value}</span>
      {copied ? (
        <HiCheck
          className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
      ) : (
        <HiClipboardCopy
          className="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
