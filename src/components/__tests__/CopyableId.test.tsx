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

  test('shows the id whole — never clipped, split, or scrolled out of view', () => {
    const subgraphId = `${GRAPH_ID}_analytics_backtest`
    const { container } = render(
      <CopyableId value={subgraphId} label="subgraph id" />
    )

    const value = screen.getByText(subgraphId)
    // Each of these has been tried and is wrong: `truncate` hides the tail,
    // `break-all` splits the token mid-value, `overflow-x-auto` puts half of
    // it behind a scroll. The id sets its own width instead.
    expect(value.className).not.toContain('truncate')
    expect(value.className).not.toContain('break-all')
    expect(value.className).not.toContain('overflow-x-auto')
    expect(value.className).toContain('whitespace-nowrap')
    // And nothing on the button caps that width.
    expect(container.querySelector('button')?.className).not.toContain(
      'max-w-full'
    )
  })

  test('carries the full id into the copy affordance for screen readers', () => {
    render(<CopyableId value={GRAPH_ID} label="graph id" />)

    expect(
      screen.getByRole('button', { name: `Copy graph id: ${GRAPH_ID}` })
    ).toBeInTheDocument()
  })
})
