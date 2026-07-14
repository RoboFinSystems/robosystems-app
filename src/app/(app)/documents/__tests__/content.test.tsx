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
import { DocumentsPageContent } from '../content'

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
}))

vi.mock('@robosystems/core/hooks/use-toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    ToastContainer: () => null,
  }),
}))

vi.mock('@robosystems/client', () => ({
  listDocuments: vi.fn(),
  getDocument: vi.fn(),
  indexDocument: vi.fn(),
  deleteDocument: vi.fn(),
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

vi.mock('react-icons/hi', () => ({
  HiArrowLeft: () => <span>Icon</span>,
  HiDocumentAdd: () => <span>Icon</span>,
  HiDocumentText: () => <span>Icon</span>,
  HiExclamation: () => <span>Icon</span>,
  HiPencil: () => <span>Icon</span>,
  HiPlus: () => <span>Icon</span>,
  HiRefresh: () => <span>Icon</span>,
  HiTrash: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children, onClick }: any) =>
    onClick ? (
      <div
        data-testid="card"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') onClick(e)
        }}
      >
        {children}
      </div>
    ) : (
      <div data-testid="card">{children}</div>
    ),
  Label: ({ children }: any) => <label>{children}</label>,
  Spinner: () => <span>Spinner</span>,
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
const mockListDocuments = vi.mocked(RoboClient.listDocuments)
const mockGetDocument = vi.mocked(RoboClient.getDocument)
const mockIndexDocument = vi.mocked(RoboClient.indexDocument)
const mockDeleteDocument = vi.mocked(RoboClient.deleteDocument)

const DOC_LIST_ITEM = {
  id: 'doc_1',
  document_title: 'Revenue Policy',
  section_count: 2,
  source_type: 'uploaded_doc',
  folder: 'policies',
  tags: ['finance'],
  created_at: '2026-07-01T12:00:00Z',
  updated_at: '2026-07-02T12:00:00Z',
}

const DOC_DETAIL = {
  id: 'doc_1',
  graph_id: 'kg_test',
  user_id: 'user_1',
  title: 'Revenue Policy',
  content: '# Revenue\n\nRecognized when earned.',
  tags: ['finance'],
  folder: 'policies',
  external_id: null,
  source_type: 'uploaded_doc',
  source_provider: null,
  sections_indexed: 2,
  created_at: '2026-07-01T12:00:00Z',
  updated_at: '2026-07-02T12:00:00Z',
}

function setGraph(graphId: string | null, isRepository = false) {
  mockUseGraphContext.mockReturnValue({
    state: { currentGraphId: graphId },
  } as any)
  mockUseIsRepository.mockReturnValue({ isRepository } as any)
}

function mockListResponse(documents: any[], total = documents.length) {
  mockListDocuments.mockResolvedValue({
    data: { total, documents, graph_id: 'kg_test' },
    error: undefined,
  } as any)
}

describe('DocumentsPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setGraph('kg_test')
    mockListResponse([])
    mockGetDocument.mockResolvedValue({
      data: DOC_DETAIL,
      error: undefined,
    } as any)
  })

  test('shows empty state and skips fetch when no graph is selected', async () => {
    setGraph(null)

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('No graph selected')).toBeInTheDocument()
    })
    expect(mockListDocuments).not.toHaveBeenCalled()
  })

  test('renders document cards from the list response', async () => {
    mockListResponse([DOC_LIST_ITEM])

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Policy')).toBeInTheDocument()
    })
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByText('policies')).toBeInTheDocument()
    expect(screen.getByText('finance')).toBeInTheDocument()
    expect(screen.getByText('2 sections')).toBeInTheDocument()
  })

  test('shows the empty knowledge base state', async () => {
    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Knowledge base is empty')).toBeInTheDocument()
    })
  })

  test('opens the viewer-only detail with rendered markdown', async () => {
    mockListResponse([DOC_LIST_ITEM])

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Policy')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Revenue Policy'))

    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test', document_id: 'doc_1' },
      })
    })
    expect(screen.getByTestId('markdown-prose')).toHaveTextContent(
      'Recognized when earned.'
    )
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  test('creates a document via the editor modal', async () => {
    mockIndexDocument.mockResolvedValue({
      data: { result: { id: 'doc_new', sections_indexed: 3 } },
      error: undefined,
    } as any)

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('New Document')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('New Document'))

    const editorModal = screen.getByTestId('editor-modal')
    expect(within(editorModal).getByText('New Document')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Document title...'), {
      target: { value: 'Expense Policy' },
    })
    fireEvent.change(screen.getByTestId('markdown-editor'), {
      target: { value: '# Expenses' },
    })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockIndexDocument).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          title: 'Expense Policy',
          content: '# Expenses',
          tags: null,
          folder: null,
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Created "Expense Policy" (3 sections)',
      5000
    )
    // The created document is fetched and shown.
    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test', document_id: 'doc_new' },
      })
    })
    // Initial fetch + refetch after create.
    expect(mockListDocuments).toHaveBeenCalledTimes(2)
  })

  test('edits a document via the editor modal, pre-filled from the record', async () => {
    mockListResponse([DOC_LIST_ITEM])
    mockIndexDocument.mockResolvedValue({
      data: { result: { id: 'doc_1', sections_indexed: 2 } },
      error: undefined,
    } as any)

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Policy')).toBeInTheDocument()
    })

    const editTooltip = screen.getByTitle('Edit')
    fireEvent.click(within(editTooltip).getByRole('button'))

    await waitFor(() => {
      expect(screen.getByTestId('editor-modal')).toBeInTheDocument()
    })
    expect(screen.getByTestId('markdown-editor')).toHaveValue(
      '# Revenue\n\nRecognized when earned.'
    )
    expect(screen.getByPlaceholderText('Document title...')).toHaveValue(
      'Revenue Policy'
    )

    fireEvent.change(screen.getByTestId('markdown-editor'), {
      target: { value: '# Revenue v2' },
    })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockIndexDocument).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          document_id: 'doc_1',
          title: 'Revenue Policy',
          content: '# Revenue v2',
          tags: ['finance'],
          folder: 'policies',
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Saved "Revenue Policy" (2 sections)',
      5000
    )
  })

  test('deletes a document via the confirm modal', async () => {
    mockListResponse([DOC_LIST_ITEM])
    mockDeleteDocument.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Policy')).toBeInTheDocument()
    })

    const deleteTooltip = screen.getByTitle('Delete')
    fireEvent.click(within(deleteTooltip).getByRole('button'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('confirm-button'))

    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { document_id: 'doc_1' },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Deleted "Revenue Policy"',
      5000
    )
  })

  test('hides authoring affordances on shared repositories', async () => {
    setGraph('sec', true)
    mockListResponse([DOC_LIST_ITEM])

    render(<DocumentsPageContent />)

    await waitFor(() => {
      expect(screen.getByText('Revenue Policy')).toBeInTheDocument()
    })
    expect(screen.queryByText('New Document')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
  })
})
