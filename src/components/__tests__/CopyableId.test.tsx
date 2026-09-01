import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { CopyableId } from '../CopyableId'

// A graph id is an address — it goes into MCP connector URLs and API calls, so
// it has to be readable and verifiable in full. Truncation is invisible to a
// DOM text query (the text stays in the document, CSS clips it), so the guard
// has to be on the class that would do the clipping.
describe('CopyableId', () => {
  const GRAPH_ID = 'kg1a05ae1d4861223bf37b'

  test('renders the whole id', () => {
    render(<CopyableId value={GRAPH_ID} label="graph id" />)

    expect(screen.getByText(GRAPH_ID)).toBeInTheDocument()
  })

  test('neither clips a long id nor splits it across lines', () => {
    const subgraphId = `${GRAPH_ID}_analytics_backtest`
    render(<CopyableId value={subgraphId} label="subgraph id" />)

    const value = screen.getByText(subgraphId)
    // `truncate` hides the tail for good; `break-all` splits the token at an
    // arbitrary character. A too-narrow container scrolls instead.
    expect(value.className).not.toContain('truncate')
    expect(value.className).not.toContain('break-all')
    expect(value.className).toContain('whitespace-nowrap')
    expect(value.className).toContain('overflow-x-auto')
  })

  test('carries the full id into the copy affordance for screen readers', () => {
    render(<CopyableId value={GRAPH_ID} label="graph id" />)

    expect(
      screen.getByRole('button', { name: `Copy graph id: ${GRAPH_ID}` })
    ).toBeInTheDocument()
  })
})
