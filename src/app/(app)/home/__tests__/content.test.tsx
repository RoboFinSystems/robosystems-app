import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AllGraphsHomePage from '../content'

const mockSDK = vi.hoisted(() => ({
  getGraphs: vi.fn(),
}))

vi.mock('@robosystems/client', () => mockSDK)

vi.mock('@robosystems/core', () => ({
  LoadingState: () => <div data-testid="loading" />,
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, actions }: any) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
  useGraphContext: () => ({
    state: { currentGraphId: 'kg_live' },
    setCurrentGraph: vi.fn(),
  }),
  useOrg: () => ({ currentOrg: { id: 'org_1', role: 'admin' } }),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const graph = (overrides: Record<string, unknown>) => ({
  graphId: 'kg_live',
  graphName: 'Live Graph',
  role: 'admin',
  isSelected: false,
  isRepository: false,
  isSubgraph: false,
  graphType: 'entity',
  createdAt: '2026-01-01T00:00:00Z',
  status: 'active',
  ...overrides,
})

// The desktop table and the mobile cards are both in the DOM under jsdom, so
// scope assertions to a row rather than counting matches across both.
const rowFor = (name: string) =>
  screen.getAllByText(name)[0].closest('tr') as HTMLElement

describe('AllGraphsHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('leaves a live graph unbadged and its actions enabled', async () => {
    mockSDK.getGraphs.mockResolvedValue({
      data: { graphs: [graph({})] },
    })

    render(<AllGraphsHomePage />)

    await waitFor(() =>
      expect(screen.getAllByText('Live Graph')).not.toHaveLength(0)
    )
    const row = rowFor('Live Graph')
    expect(within(row).queryByText('Suspended')).not.toBeInTheDocument()
    expect(within(row).getByText('Open').closest('button')).toBeEnabled()
  })

  // A canceled subscription suspends the graph but leaves it listed through
  // the retention window; every request against it 403s, so the row has to say
  // so instead of offering actions that only produce an error page.
  it('badges a suspended graph and disables its actions', async () => {
    mockSDK.getGraphs.mockResolvedValue({
      data: {
        graphs: [
          graph({
            graphId: 'kg_dead',
            graphName: 'Suspended Graph',
            status: 'suspended',
          }),
        ],
      },
    })

    render(<AllGraphsHomePage />)

    await waitFor(() =>
      expect(screen.getAllByText('Suspended Graph')).not.toHaveLength(0)
    )
    const row = rowFor('Suspended Graph')
    expect(within(row).getByText('Suspended')).toBeInTheDocument()
    expect(within(row).getByText('Open').closest('button')).toBeDisabled()
    expect(within(row).getByText('Console').closest('button')).toBeDisabled()
    expect(within(row).getByText('Usage').closest('button')).toBeDisabled()
  })

  // An API build that predates the status field must not gray out every graph.
  it('treats a missing status as live', async () => {
    mockSDK.getGraphs.mockResolvedValue({
      data: { graphs: [graph({ status: undefined })] },
    })

    render(<AllGraphsHomePage />)

    await waitFor(() =>
      expect(screen.getAllByText('Live Graph')).not.toHaveLength(0)
    )
    const row = rowFor('Live Graph')
    expect(within(row).getByText('Open').closest('button')).toBeEnabled()
  })
})
