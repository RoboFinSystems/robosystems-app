import * as RoboClient from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { RecallPanel } from '../RecallPanel'

// Mock the core search primitives so the test drives RecallPanel's own
// logic (filters, expansion, open) rather than the shared UI. Real
// flowbite + react-icons render fine in jsdom.
vi.mock('@robosystems/core', () => ({
  SearchBar: ({ query, onQueryChange, onSearch, buttonLabel }: any) => (
    <div>
      <input
        placeholder="What do you want to recall?"
        value={query}
        onChange={(e: any) => onQueryChange(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') onSearch()
        }}
      />
      <button onClick={onSearch}>{buttonLabel}</button>
    </div>
  ),
  SearchHitCard: ({ hit, onClick, expanded, children }: any) => (
    <div data-testid={`hit-${hit.document_id}`}>
      <button onClick={onClick}>
        <span>{hit.score.toFixed(2)}</span>
        <span>{hit.snippet}</span>
      </button>
      {expanded ? <div data-testid="expanded">{children}</div> : null}
    </div>
  ),
  SearchResultsMeta: ({ children }: any) => <p>{children}</p>,
  MarkdownProse: ({ children }: any) => (
    <div data-testid="markdown-prose">{children}</div>
  ),
}))

vi.mock('@robosystems/client', () => ({
  recallMemory: vi.fn(),
  getMemory: vi.fn(),
}))

const mockRecall = vi.mocked(RoboClient.recallMemory)
const mockGetMemory = vi.mocked(RoboClient.getMemory)

const HIT = {
  document_id: 'mem_1',
  score: 0.87,
  source_type: 'memory',
  snippet: 'Acme pays invoices net 30',
  tags: ['billing'],
}

function recallResponse(hits: any[] = [HIT]) {
  return {
    data: { total: hits.length, hits, query: 'terms', graph_id: 'kg_test' },
    error: undefined,
  } as any
}

async function runRecall(query = 'payment terms') {
  const input = screen.getByPlaceholderText('What do you want to recall?')
  fireEvent.change(input, { target: { value: query } })
  fireEvent.click(screen.getByRole('button', { name: 'Recall' }))
  await waitFor(() => expect(mockRecall).toHaveBeenCalled())
}

describe('RecallPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRecall.mockResolvedValue(recallResponse())
  })

  test('recalls with the query and default k, no filters', async () => {
    render(<RecallPanel graphId="kg_test" onSelectHit={vi.fn()} />)
    await runRecall()

    expect(mockRecall).toHaveBeenCalledWith({
      path: { graph_id: 'kg_test' },
      body: { query: 'payment terms', k: 10 },
    })
    expect(screen.getByText('0.87')).toBeInTheDocument()
    expect(screen.getByText(/Recalled 1 memory/)).toBeInTheDocument()
  })

  test('includes Type/Source filters in the recall body when set', async () => {
    render(<RecallPanel graphId="kg_test" onSelectHit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Filters/ }))
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'fact' },
    })
    fireEvent.change(screen.getByLabelText('Source'), {
      target: { value: 'mcp' },
    })

    await runRecall()

    expect(mockRecall).toHaveBeenCalledWith({
      path: { graph_id: 'kg_test' },
      body: {
        query: 'payment terms',
        k: 10,
        memory_type: 'fact',
        source: 'mcp',
      },
    })
  })

  test('expands a hit inline and fetches the full memory', async () => {
    mockGetMemory.mockResolvedValue({
      data: {
        id: 'mem_1',
        text: 'Acme Corp pays all invoices on a net-30 basis.',
        memory_type: 'fact',
        source: 'mcp',
        tags: ['billing'],
        updated_at: '2026-07-02T12:00:00Z',
      },
      error: undefined,
    } as any)

    render(<RecallPanel graphId="kg_test" onSelectHit={vi.fn()} />)
    await runRecall()

    fireEvent.click(screen.getByText('0.87'))

    await waitFor(() => {
      expect(mockGetMemory).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test', memory_id: 'mem_1' },
      })
    })
    expect(screen.getByTestId('expanded')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-prose')).toHaveTextContent(
      'Acme Corp pays all invoices on a net-30 basis.'
    )
    expect(screen.getByText('fact')).toBeInTheDocument()
    expect(screen.getByText('mcp')).toBeInTheDocument()
  })

  test('"Open memory" navigates via onSelectHit', async () => {
    const onSelectHit = vi.fn()
    mockGetMemory.mockResolvedValue({
      data: {
        id: 'mem_1',
        text: 'full text',
        memory_type: 'fact',
        source: 'mcp',
        updated_at: '2026-07-02T12:00:00Z',
      },
      error: undefined,
    } as any)

    render(<RecallPanel graphId="kg_test" onSelectHit={onSelectHit} />)
    await runRecall()
    fireEvent.click(screen.getByText('0.87'))

    await screen.findByRole('button', { name: /Open memory/ })
    fireEvent.click(screen.getByRole('button', { name: /Open memory/ }))
    expect(onSelectHit).toHaveBeenCalledWith('mem_1')
  })

  test('collapses an expanded hit when clicked again', async () => {
    mockGetMemory.mockResolvedValue({
      data: {
        id: 'mem_1',
        text: 'full text',
        memory_type: 'fact',
        source: 'mcp',
        updated_at: '2026-07-02T12:00:00Z',
      },
      error: undefined,
    } as any)

    render(<RecallPanel graphId="kg_test" onSelectHit={vi.fn()} />)
    await runRecall()

    fireEvent.click(screen.getByText('0.87'))
    await screen.findByTestId('expanded')

    fireEvent.click(screen.getByText('0.87'))
    await waitFor(() =>
      expect(screen.queryByTestId('expanded')).not.toBeInTheDocument()
    )
  })

  test('shows a soft notice when recall is not enabled', async () => {
    mockRecall.mockResolvedValue({
      data: undefined,
      error: { detail: 'not enabled' },
      response: { status: 503 },
    } as any)

    render(<RecallPanel graphId="kg_test" onSelectHit={vi.fn()} />)
    await runRecall()

    expect(
      screen.getByText('Semantic memory is not enabled for this graph.')
    ).toBeInTheDocument()
  })
})
