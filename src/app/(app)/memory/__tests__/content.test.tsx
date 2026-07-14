import * as RoboClient from '@robosystems/client'
import { useGraphContext, useIsRepository } from '@robosystems/core'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MemoryPageContent } from '../content'

// Stable references — showError is a dependency of the page's fetch callback,
// so fresh mocks per render would retrigger the fetch effect.
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  useIsRepository: vi.fn(),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, subtitle, actions }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{subtitle}</div>
      <div>{actions}</div>
    </div>
  ),
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
  LoadingState: ({ message }: any) => <div>{message}</div>,
  ConfirmModal: ({ show, onConfirm, onClose, title, children }: any) =>
    show ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        {children}
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
  MarkdownProse: ({ children }: any) => (
    <div data-testid="markdown-prose">{children}</div>
  ),
  TagInput: ({ tags, onChange, id }: any) => (
    <input
      data-testid="tag-input"
      id={id}
      value={tags.join(',')}
      onChange={(e: any) =>
        onChange(e.target.value ? e.target.value.split(',') : [])
      }
    />
  ),
  CategoryInput: ({ value, onChange, id }: any) => (
    <input
      data-testid="category-input"
      id={id}
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
    />
  ),
  SearchBar: ({
    query,
    onQueryChange,
    onSearch,
    placeholder,
    buttonLabel = 'Search',
    onClear,
    showClear,
  }: any) => (
    <div>
      <input
        placeholder={placeholder}
        value={query}
        onChange={(e: any) => onQueryChange(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') onSearch()
        }}
      />
      <button onClick={onSearch}>{buttonLabel}</button>
      {onClear && showClear ? <button onClick={onClear}>Clear</button> : null}
    </div>
  ),
  SearchHitCard: ({ hit, onClick }: any) => (
    <button type="button" onClick={onClick}>
      <span>{hit.score.toFixed(2)}</span>
      {hit.tags?.map((tag: string) => (
        <span key={tag}>{tag}</span>
      ))}
      <p>{hit.snippet}</p>
    </button>
  ),
  SearchResultsMeta: ({ children, total, query }: any) => (
    <p>{children ?? `${total} results for "${query}"`}</p>
  ),
}))

vi.mock('@/components/editor/EditorModal', () => ({
  EditorModal: ({
    show,
    title,
    onSave,
    onClose,
    canSave,
    saving,
    saveLabel = 'Save',
    children,
  }: any) =>
    show ? (
      <div data-testid="editor-modal">
        <span>{title}</span>
        {children}
        <button onClick={onSave} disabled={saving || !canSave}>
          {saveLabel}
        </button>
        <button onClick={onClose}>Close Editor</button>
      </div>
    ) : null,
}))

vi.mock('@/components/editor/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('@robosystems/core/hooks/use-toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    ToastContainer: () => null,
  }),
}))

vi.mock('@robosystems/client', () => ({
  listMemories: vi.fn(),
  getMemory: vi.fn(),
  recallMemory: vi.fn(),
  remember: vi.fn(),
  updateMemory: vi.fn(),
  forget: vi.fn(),
}))

vi.mock('react-icons/hi', () => ({
  HiArrowLeft: () => <span>Icon</span>,
  HiExclamation: () => <span>Icon</span>,
  HiLightBulb: () => <span>Icon</span>,
  HiPencil: () => <span>Icon</span>,
  HiPlus: () => <span>Icon</span>,
  HiRefresh: () => <span>Icon</span>,
  HiSave: () => <span>Icon</span>,
  HiSearch: () => <span>Icon</span>,
  HiTrash: () => <span>Icon</span>,
  HiX: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Label: ({ children }: any) => <label>{children}</label>,
  Select: ({ value, onChange, children, ...props }: any) => (
    <select value={value} onChange={onChange} {...props}>
      {children}
    </select>
  ),
  Spinner: () => <span>Spinner</span>,
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableHead: ({ children }: any) => (
    <thead>
      <tr>{children}</tr>
    </thead>
  ),
  TableHeadCell: ({ children }: any) => <th>{children}</th>,
  TableRow: ({ children, onClick }: any) => (
    <tr onClick={onClick}>{children}</tr>
  ),
  Textarea: ({ value, onChange, placeholder, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
  TextInput: ({ value, onChange, onKeyDown, placeholder, ...props }: any) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      {...props}
    />
  ),
  Tooltip: ({ content, children }: any) => (
    <div title={content}>{children}</div>
  ),
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockUseIsRepository = vi.mocked(useIsRepository)
const mockListMemories = vi.mocked(RoboClient.listMemories)
const mockRecallMemory = vi.mocked(RoboClient.recallMemory)
const mockRemember = vi.mocked(RoboClient.remember)
const mockUpdateMemory = vi.mocked(RoboClient.updateMemory)
const mockForget = vi.mocked(RoboClient.forget)

const MEMORY_FIXTURE = {
  id: 'mem_1',
  text: 'Acme pays invoices net 30',
  memory_type: 'fact',
  source: 'mcp',
  tags: ['billing', 'acme'],
  source_ref: null,
  provenance: null,
  created_by: 'user_1',
  created_at: '2026-07-01T12:00:00Z',
  updated_at: '2026-07-02T12:00:00Z',
}

function setGraph(graphId: string | null, isRepository = false) {
  mockUseGraphContext.mockReturnValue({
    state: { currentGraphId: graphId },
  } as any)
  mockUseIsRepository.mockReturnValue({ isRepository } as any)
}

function mockListResponse(memories: any[], total = memories.length) {
  mockListMemories.mockResolvedValue({
    data: { total, memories, graph_id: 'kg_test' },
    error: undefined,
  } as any)
}

describe('MemoryPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setGraph('kg_test')
    mockListResponse([])
  })

  test('shows empty state and skips fetch when no graph is selected', async () => {
    setGraph(null)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('No graph selected')).toBeInTheDocument()
    })
    expect(mockListMemories).not.toHaveBeenCalled()
  })

  test('shows repository notice and skips fetch for shared repositories', async () => {
    setGraph('sec', true)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(
        screen.getByText('Not available for shared repositories')
      ).toBeInTheDocument()
    })
    expect(mockListMemories).not.toHaveBeenCalled()
  })

  test('renders memory rows from the list response', async () => {
    mockListResponse([MEMORY_FIXTURE])

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
    })
    const table = screen.getByRole('table')
    expect(within(table).getByText('fact')).toBeInTheDocument()
    expect(within(table).getByText('billing')).toBeInTheDocument()
    expect(mockListMemories).toHaveBeenCalledWith({
      path: { graph_id: 'kg_test' },
      query: {
        limit: 50,
        offset: 0,
        memory_type: undefined,
        source: undefined,
      },
    })
  })

  test('shows soft "not enabled" state when the API returns 503', async () => {
    mockListMemories.mockResolvedValue({
      data: undefined,
      error: { detail: 'Semantic memory is not enabled' },
      response: { status: 503 },
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(
        screen.getByText('Semantic memory is not enabled')
      ).toBeInTheDocument()
    })
    expect(screen.queryByText('Error loading memories')).not.toBeInTheDocument()
    expect(mockShowError).not.toHaveBeenCalled()
  })

  test('shows hard error with retry for unexpected failures', async () => {
    mockListMemories.mockResolvedValue({
      data: undefined,
      error: { detail: 'boom' },
      response: { status: 500 },
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Error loading memories')).toBeInTheDocument()
    })

    mockListResponse([MEMORY_FIXTURE])
    fireEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
    })
    expect(mockListMemories).toHaveBeenCalledTimes(2)
  })

  test('creates a memory via the editor modal', async () => {
    mockRemember.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('New Memory')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('New Memory'))

    const editorModal = screen.getByTestId('editor-modal')
    expect(within(editorModal).getByText('New Memory')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('markdown-editor'), {
      target: { value: 'Quarter close starts on the 25th' },
    })
    fireEvent.click(screen.getByText('Remember'))

    await waitFor(() => {
      expect(mockRemember).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          text: 'Quarter close starts on the 25th',
          memory_type: 'note',
          tags: null,
          source_ref: null,
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory stored', 5000)
    // Modal closes and the list refetches (initial fetch + post-create).
    await waitFor(() => {
      expect(screen.queryByTestId('editor-modal')).not.toBeInTheDocument()
    })
    expect(mockListMemories).toHaveBeenCalledTimes(2)
  })

  test('edits a memory via the editor modal, pre-filled from the record', async () => {
    mockListResponse([MEMORY_FIXTURE])
    mockUpdateMemory.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
    })

    const editTooltip = screen.getByTitle('Edit')
    fireEvent.click(within(editTooltip).getByRole('button'))

    const editorTextarea = screen.getByTestId('markdown-editor')
    expect(editorTextarea).toHaveValue('Acme pays invoices net 30')

    fireEvent.change(editorTextarea, {
      target: { value: 'Acme pays invoices net 45' },
    })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockUpdateMemory).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          memory_id: 'mem_1',
          text: 'Acme pays invoices net 45',
          memory_type: 'fact',
          tags: ['billing', 'acme'],
          source_ref: null,
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory updated', 5000)
  })

  test('renders the memory detail through the markdown viewer', async () => {
    mockListResponse([MEMORY_FIXTURE])

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Acme pays invoices net 30'))

    await waitFor(() => {
      expect(screen.getByTestId('markdown-prose')).toHaveTextContent(
        'Acme pays invoices net 30'
      )
    })
  })

  test('forgets a memory via the confirm modal', async () => {
    mockListResponse([MEMORY_FIXTURE])
    mockForget.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
    })

    const forgetTooltip = screen.getByTitle('Forget')
    fireEvent.click(within(forgetTooltip).getByRole('button'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('confirm-button'))

    await waitFor(() => {
      expect(mockForget).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { memory_id: 'mem_1' },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory forgotten', 5000)
  })

  test('recalls memories and renders scored hits', async () => {
    mockRecallMemory.mockResolvedValue({
      data: {
        total: 1,
        hits: [
          {
            document_id: 'mem_1',
            score: 0.87,
            source_type: 'memory',
            snippet: 'Acme pays invoices net 30',
            tags: ['billing'],
          },
        ],
        query: 'payment terms',
        graph_id: 'kg_test',
      },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('What do you want to recall?')
      ).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('What do you want to recall?')
    fireEvent.change(input, { target: { value: 'payment terms' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockRecallMemory).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { query: 'payment terms', k: 10 },
      })
    })
    expect(screen.getByText('0.87')).toBeInTheDocument()
    expect(screen.getByText('Acme pays invoices net 30')).toBeInTheDocument()
  })
})
