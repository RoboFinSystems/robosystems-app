import * as RoboClient from '@robosystems/client'
import { useGraphContext, useIsRepository } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MemoryPageContent } from '../content'

// Stable references — passed into the (mocked) toast hook.
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

// The collection is exercised in its own suite; here it's a lightweight stub
// that lets the page shell drive edit/delete and the loaded-count callback.
let collectionProps: any = null
vi.mock('../components/MemoryCollection', () => ({
  MemoryCollection: (props: any) => {
    collectionProps = props
    return <div data-testid="memory-collection" />
  },
}))

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
}))

vi.mock('../components/MemoryEditorModal', () => ({
  MemoryEditorModal: ({ show, initial, onSubmit, onClose }: any) =>
    show ? (
      <div data-testid="editor-modal">
        <span>{initial ? 'Edit Memory' : 'New Memory'}</span>
        <button
          data-testid="editor-submit"
          onClick={() =>
            onSubmit({
              text: 'submitted text',
              memoryType: 'note',
              tags: [],
              sourceRef: '',
            })
          }
        >
          Save
        </button>
        <button onClick={onClose}>Close Editor</button>
      </div>
    ) : null,
}))

vi.mock('@robosystems/core/hooks/use-toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    ToastContainer: () => null,
  }),
}))

vi.mock('@robosystems/client', () => ({
  remember: vi.fn(),
  updateMemory: vi.fn(),
  forget: vi.fn(),
}))

vi.mock('react-icons/hi', () => ({
  HiExclamation: () => <span>Icon</span>,
  HiLightBulb: () => <span>Icon</span>,
  HiPlus: () => <span>Icon</span>,
  HiTrash: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Label: ({ children }: any) => <label>{children}</label>,
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockUseIsRepository = vi.mocked(useIsRepository)
const mockRemember = vi.mocked(RoboClient.remember)
const mockUpdateMemory = vi.mocked(RoboClient.updateMemory)
const mockForget = vi.mocked(RoboClient.forget)

const MEMORY_FIXTURE = {
  id: 'mem_1',
  text: 'Acme pays invoices net 30',
  memory_type: 'fact',
  source: 'mcp',
  tags: ['billing'],
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

describe('MemoryPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    collectionProps = null
    setGraph('kg_test')
  })

  test('shows empty state when no graph is selected', () => {
    setGraph(null)
    render(<MemoryPageContent />)
    expect(screen.getByText('No graph selected')).toBeInTheDocument()
    expect(screen.queryByTestId('memory-collection')).not.toBeInTheDocument()
  })

  test('shows repository notice for shared repositories', () => {
    setGraph('sec', true)
    render(<MemoryPageContent />)
    expect(
      screen.getByText('Not available for shared repositories')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('memory-collection')).not.toBeInTheDocument()
  })

  test('renders the header count from the collection callback', async () => {
    render(<MemoryPageContent />)
    expect(screen.getByTestId('memory-collection')).toBeInTheDocument()

    // The collection reports the loaded page + total.
    collectionProps.onLoaded([MEMORY_FIXTURE], 7)
    await waitFor(() =>
      expect(screen.getByText(/7 memories stored/)).toBeInTheDocument()
    )
  })

  test('opens the create modal from the header action', () => {
    render(<MemoryPageContent />)
    fireEvent.click(screen.getByText('New Memory'))
    const modal = screen.getByTestId('editor-modal')
    expect(modal).toHaveTextContent('New Memory')
  })

  test('creates a memory via the editor modal', async () => {
    mockRemember.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)
    fireEvent.click(screen.getByText('New Memory'))
    fireEvent.click(screen.getByTestId('editor-submit'))

    await waitFor(() => {
      expect(mockRemember).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          text: 'submitted text',
          memory_type: 'note',
          tags: null,
          source_ref: null,
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory stored', 5000)
  })

  test('edits a memory opened from the collection', async () => {
    mockUpdateMemory.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)
    // The collection asks the page to open the editor for a record.
    collectionProps.onEdit(MEMORY_FIXTURE)

    await waitFor(() =>
      expect(screen.getByTestId('editor-modal')).toHaveTextContent(
        'Edit Memory'
      )
    )
    fireEvent.click(screen.getByTestId('editor-submit'))

    await waitFor(() => {
      expect(mockUpdateMemory).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: {
          memory_id: 'mem_1',
          text: 'submitted text',
          memory_type: 'note',
          tags: null,
          source_ref: null,
        },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory updated', 5000)
  })

  test('forgets a memory via the confirm modal', async () => {
    mockForget.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)
    collectionProps.onDelete(MEMORY_FIXTURE)

    await waitFor(() =>
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('confirm-button'))

    await waitFor(() => {
      expect(mockForget).toHaveBeenCalledWith({
        path: { graph_id: 'kg_test' },
        body: { memory_id: 'mem_1' },
      })
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Memory forgotten', 5000)
  })

  test('bumps refreshKey after a mutation so the collection refetches', async () => {
    mockRemember.mockResolvedValue({
      data: { status: 'completed' },
      error: undefined,
    } as any)

    render(<MemoryPageContent />)
    const initialKey = collectionProps.refreshKey

    fireEvent.click(screen.getByText('New Memory'))
    fireEvent.click(screen.getByTestId('editor-submit'))

    await waitFor(() => expect(collectionProps.refreshKey).toBe(initialKey + 1))
  })
})
