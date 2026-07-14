import * as RoboClient from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MemoryCollection } from '../MemoryCollection'

// Stub the core search bar + empty state, and MemoryCard, so the test drives
// the collection's orchestration (browse ↔ recall, filters, show-all,
// pagination) rather than presentational internals. Real flowbite renders
// the Select/Card/Button in jsdom.
vi.mock('@robosystems/core', () => ({
  SearchBar: ({
    query,
    onQueryChange,
    onSearch,
    buttonLabel,
    onClear,
  }: any) => (
    <div>
      <input
        placeholder="Search your memories..."
        value={query}
        onChange={(e: any) => onQueryChange(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') onSearch()
        }}
      />
      <button onClick={onSearch}>{buttonLabel}</button>
      {onClear ? <button onClick={onClear}>ClearBar</button> : null}
    </div>
  ),
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}))

vi.mock('../MemoryCard', () => ({
  MemoryCard: ({ memory, score, onEdit, onDelete }: any) => (
    <div data-testid={`card-${memory.id}`}>
      {score !== undefined && (
        <span data-testid={`score-${memory.id}`}>{score.toFixed(2)}</span>
      )}
      <span>{memory.text}</span>
      <button onClick={onEdit}>edit-{memory.id}</button>
      <button onClick={onDelete}>delete-{memory.id}</button>
    </div>
  ),
}))

vi.mock('@robosystems/client', () => ({
  listMemories: vi.fn(),
  recallMemory: vi.fn(),
  getMemory: vi.fn(),
}))

const mockList = vi.mocked(RoboClient.listMemories)
const mockRecall = vi.mocked(RoboClient.recallMemory)
const mockGetMemory = vi.mocked(RoboClient.getMemory)

function memory(id: string, over: Record<string, unknown> = {}) {
  return {
    id,
    text: `Memory ${id}`,
    memory_type: 'fact',
    source: 'mcp',
    tags: ['t'],
    updated_at: '2026-07-02T12:00:00Z',
    ...over,
  }
}

function listResponse(memories: any[], total = memories.length) {
  return {
    data: { total, memories, graph_id: 'kg_test' },
    error: undefined,
  } as any
}

function renderCollection(props: Partial<any> = {}) {
  return render(
    <MemoryCollection
      graphId="kg_test"
      refreshKey={0}
      onLoaded={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...props}
    />
  )
}

describe('MemoryCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue(listResponse([memory('1'), memory('2')]))
  })

  test('loads and renders all memories as cards by default', async () => {
    renderCollection()

    expect(await screen.findByTestId('card-1')).toBeInTheDocument()
    expect(screen.getByTestId('card-2')).toBeInTheDocument()
    expect(mockList).toHaveBeenCalledWith({
      path: { graph_id: 'kg_test' },
      query: { limit: 50, offset: 0 },
    })
  })

  test('reports the loaded page and total via onLoaded', async () => {
    const onLoaded = vi.fn()
    mockList.mockResolvedValue(listResponse([memory('1')], 5))
    renderCollection({ onLoaded })

    await waitFor(() =>
      expect(onLoaded).toHaveBeenCalledWith(
        [expect.objectContaining({ id: '1' })],
        5
      )
    )
  })

  test('recall narrows to a ranked subset resolved from loaded records', async () => {
    mockRecall.mockResolvedValue({
      data: {
        total: 1,
        hits: [
          {
            document_id: '2',
            score: 0.91,
            snippet: 'x',
            source_type: 'memory',
          },
        ],
        query: 'q',
        graph_id: 'kg_test',
      },
      error: undefined,
    } as any)

    renderCollection()
    await screen.findByTestId('card-1')

    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: 'invoices' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Recall' }))

    await waitFor(() =>
      expect(mockRecall).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { query: 'invoices', k: 10 },
      })
    )
    // Only the matched memory shows, with a score, and no getMemory needed
    // (it was in the loaded page).
    expect(await screen.findByTestId('score-2')).toHaveTextContent('0.91')
    expect(screen.queryByTestId('card-1')).not.toBeInTheDocument()
    expect(screen.getByText(/1 result for "invoices"/)).toBeInTheDocument()
    expect(mockGetMemory).not.toHaveBeenCalled()
  })

  test('fetches a hit not present in the loaded page', async () => {
    mockRecall.mockResolvedValue({
      data: {
        total: 1,
        hits: [
          {
            document_id: '99',
            score: 0.7,
            snippet: 'x',
            source_type: 'memory',
          },
        ],
        query: 'q',
        graph_id: 'kg_test',
      },
      error: undefined,
    } as any)
    mockGetMemory.mockResolvedValue({
      data: memory('99', { text: 'Memory 99' }),
      error: undefined,
    } as any)

    renderCollection()
    await screen.findByTestId('card-1')

    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: 'x' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Recall' }))

    await waitFor(() =>
      expect(mockGetMemory).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test', memory_id: '99' },
      })
    )
    expect(await screen.findByTestId('card-99')).toBeInTheDocument()
  })

  test('Show all resets from search back to the full list', async () => {
    mockRecall.mockResolvedValue({
      data: {
        total: 1,
        hits: [
          { document_id: '2', score: 0.9, snippet: 'x', source_type: 'memory' },
        ],
        query: 'q',
        graph_id: 'kg_test',
      },
      error: undefined,
    } as any)

    renderCollection()
    await screen.findByTestId('card-1')
    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: 'x' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Recall' }))

    await screen.findByText(/1 result for "x"/)
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))

    expect(await screen.findByTestId('card-1')).toBeInTheDocument()
    expect(screen.getByTestId('card-2')).toBeInTheDocument()
    expect(screen.queryByText(/result for/)).not.toBeInTheDocument()
  })

  test('applies Type/Source filters to the browse query and recall body', async () => {
    mockRecall.mockResolvedValue({
      data: { total: 0, hits: [], query: 'q', graph_id: 'kg_test' },
      error: undefined,
    } as any)

    renderCollection()
    await screen.findByTestId('card-1')

    fireEvent.click(screen.getByRole('button', { name: /Filters/ }))
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'fact' },
    })

    // Browse list refetches with the filter.
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({
        path: { graph_id: 'kg_test' },
        query: { limit: 50, offset: 0, memory_type: 'fact' },
      })
    )

    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: 'q' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Recall' }))

    await waitFor(() =>
      expect(mockRecall).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { query: 'q', k: 10, memory_type: 'fact' },
      })
    )
  })

  test('paginates the browse list when the total exceeds a page', async () => {
    mockList.mockResolvedValue(listResponse([memory('1')], 120))
    renderCollection()
    await screen.findByTestId('card-1')

    const prev = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })
    expect(prev).toBeDisabled()
    expect(next).not.toBeDisabled()

    fireEvent.click(next)
    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({
        path: { graph_id: 'kg_test' },
        query: { limit: 50, offset: 50 },
      })
    )
  })

  test('shows the empty state when there are no memories', async () => {
    mockList.mockResolvedValue(listResponse([], 0))
    renderCollection()
    expect(await screen.findByTestId('empty-state')).toHaveTextContent(
      'No memories yet'
    )
  })

  test('shows the not-enabled state when the API 503s', async () => {
    mockList.mockResolvedValue({
      data: undefined,
      error: { detail: 'off' },
      response: { status: 503 },
    } as any)
    renderCollection()
    expect(await screen.findByTestId('empty-state')).toHaveTextContent(
      'Semantic memory is not enabled'
    )
  })

  test('surfaces edit and delete from a card', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    renderCollection({ onEdit, onDelete })
    await screen.findByTestId('card-1')

    fireEvent.click(screen.getByText('edit-1'))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))

    fireEvent.click(screen.getByText('delete-2'))
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }))
  })
})
