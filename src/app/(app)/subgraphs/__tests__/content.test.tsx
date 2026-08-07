import { listSubgraphs } from '@robosystems/client'
import { useGraphContext } from '@robosystems/core'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { SubgraphsContent } from '../content'

const mockPush = vi.fn()

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, subtitle, actions }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{subtitle}</div>
      <div>{actions}</div>
    </div>
  ),
  StatCard: ({ label, value }: any) => (
    <div>
      {label}: {value}
    </div>
  ),
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  LoadingState: ({ message }: any) => <div>{message}</div>,
  ConfirmModal: ({ show, children }: any) =>
    show ? <div>{children}</div> : null,
}))

vi.mock('@robosystems/core/task-monitoring/operationHooks', () => ({
  useOperationMonitoring: () => ({
    startMonitoring: vi.fn(),
    reset: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('react-icons/hi', () => ({
  HiCheck: () => <span>Icon</span>,
  HiChip: () => <span>Icon</span>,
  HiClipboardCopy: () => <span>Icon</span>,
  HiDatabase: () => <span>Icon</span>,
  HiExclamationCircle: () => <span>Icon</span>,
  HiPlus: () => <span>Icon</span>,
  HiPuzzle: () => <span>Icon</span>,
  HiTrash: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Spinner: () => <span>Loading</span>,
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => (
    <thead>
      <tr>{children}</tr>
    </thead>
  ),
  TableHeadCell: ({ children }: any) => <th>{children}</th>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  Tooltip: ({ children }: any) => <>{children}</>,
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockListSubgraphs = vi.mocked(listSubgraphs)

const SUBGRAPH = {
  graph_id: 'kg1a2b3c_entities',
  subgraph_name: 'entities',
  display_name: 'Related Entities',
  subgraph_type: 'static',
  status: 'active',
  size_mb: 0.02,
  created_at: '2026-08-07T00:00:00Z',
}

const setup = (response: any) => {
  mockUseGraphContext.mockReturnValue({
    state: { currentGraphId: 'kg1a2b3c', graphs: [], isLoading: false },
  } as any)
  mockListSubgraphs.mockResolvedValue({ data: response } as any)
}

describe('SubgraphsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the full subgraph id as a copyable address', async () => {
    setup({
      parent_graph_name: 'Acme Ledger',
      parent_graph_tier: 'ladybug-standard',
      subgraph_count: 1,
      max_subgraphs: 3,
      subgraphs: [SUBGRAPH],
    })

    render(<SubgraphsContent />)

    // The id itself, not just the short name hidden in a title attribute.
    // Both the desktop table and the mobile card render it.
    const ids = await screen.findAllByRole('button', {
      name: /Copy subgraph id: kg1a2b3c_entities/,
    })
    expect(ids).toHaveLength(2)
    expect(ids[0]).toHaveTextContent('kg1a2b3c_entities')

    // The parent's id is an address too — MCP needs it to reach the parent.
    expect(
      screen.getByRole('button', { name: /Copy parent graph id: kg1a2b3c/ })
    ).toBeInTheDocument()
  })

  test('deep-links each subgraph to its MCP connector', async () => {
    setup({
      parent_graph_name: 'Acme Ledger',
      subgraph_count: 1,
      max_subgraphs: 3,
      subgraphs: [SUBGRAPH],
    })

    render(<SubgraphsContent />)

    const connect = await screen.findAllByText('Connect')
    connect[0].click()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/connect?workspace=kg1a2b3c_entities'
      )
    })
  })

  test('prefers byte-precise sizes over the rounded MB figure', async () => {
    setup({
      parent_graph_name: 'Acme Ledger',
      parent_graph_tier: 'ladybug-standard',
      subgraph_count: 1,
      max_subgraphs: 3,
      total_size_bytes: 25 * 1024,
      total_size_mb: 0.02,
      subgraphs: [{ ...SUBGRAPH, size_bytes: 25 * 1024 }],
    })

    render(<SubgraphsContent />)

    // 25600 bytes reads "25 KB"; the rounded 0.02 MB fallback would say "20 KB".
    const sizes = await screen.findAllByText('25 KB')
    expect(sizes.length).toBeGreaterThan(0)
    expect(screen.queryByText('20 KB')).not.toBeInTheDocument()
  })

  test('blocks creation and explains why at the tier cap', async () => {
    setup({
      parent_graph_name: 'Acme Ledger',
      subgraph_count: 3,
      max_subgraphs: 3,
      subgraphs: [SUBGRAPH],
    })

    render(<SubgraphsContent />)

    await waitFor(() => {
      expect(screen.getByText(/Subgraph quota reached/)).toBeInTheDocument()
    })
    expect(screen.getByText('Create Subgraph').closest('button')).toBeDisabled()
    expect(screen.getByText(/Subgraphs: 3 \/ 3/)).toBeInTheDocument()
  })
})
