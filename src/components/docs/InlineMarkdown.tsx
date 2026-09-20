import type { ReactNode } from 'react'

// Field, argument and property descriptions are markdown — the same text the API
// publishes to GraphiQL, the SDK snapshot and the MCP schema tool. They render in table
// cells and one-line paragraphs, where a block renderer would add paragraph margins, so
// this handles the one construct that actually occurs in them: a `backticked` code span.
//
// Without it the markers are the text: `/docs/api` showed readers "returns a
// ``link_token`` for Plaid Link" with the backticks in the sentence. Summary lines take
// the other path and strip the markers instead — `summarize()` does that — because a
// code box inside a one-line card is louder than the name it wraps.
//
// Everything outside a span stays literal text, which is also what makes this safe: no
// HTML is ever interpreted, so a description containing `<script>` renders as characters.

const CODE =
  'rounded bg-gray-800 px-1 py-0.5 font-mono text-[0.9em] text-cyan-300'

export function InlineMarkdown({ children }: { children: string }): ReactNode {
  // A capturing split alternates literal text and span contents, so odd indices are
  // the code spans. An unmatched trailing backtick stays in the text, as it should.
  const parts = children.split(/`([^`]+)`/g)
  if (parts.length === 1) return children
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className={CODE}>
            {part}
          </code>
        ) : (
          part
        )
      )}
    </>
  )
}
