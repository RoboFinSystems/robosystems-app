import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GraphDashboardContent } from '../content'

const mockSDK = vi.hoisted(() => ({
  getGraphs: vi.fn(),
  getGraphMetrics: vi.fn(),
}))

vi.mock('@robosystems/client', () => mockSDK)

const mockCore = vi.hoisted(() => ({
  graphId: 'kg123' as string | null,
  isRepository: false,
  role: 'admin',
  description: undefined as string | undefined,
  tags: undefined as string[] | undefined,
  refreshGraphs: vi.fn(),
}))

vi.mock('@robosystems/core', () => ({
  LoadingState: () => <div data-testid="loading" />,
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, actions }: any) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
  StatCard: ({ label, value }: any) => (
    <div>
      {label}: {value}
    </div>
  ),
  useGraphContext: () => ({
    state: { currentGraphId: mockCore.graphId },
    refreshGraphs: mockCore.refreshGraphs,
  }),
  useIsRepository: () => ({
    isRepository: mockCore.isRepository,
    currentGraph: { graphId: mockCore.graphId },
  }),
  useOrg: () => ({ currentOrg: { id: 'org_1', name: 'Test Org' } }),
}))

// The modal has its own tests; here we only care that the dashboard exposes a
// way to open it — the entry point is the thing that regressed before.
vi.mock('@/components/app/GraphMembersModal', () => ({
  default: ({ show }: { show: boolean }) =>
    show ? <div data-testid="members-modal" /> : null,
}))

vi.mock('@/components/app/GraphMetadataModal', () => ({
  default: ({ show }: { show: boolean }) =>
    show ? <div data-testid="metadata-modal" /> : null,
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('GraphDashboardContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCore.graphId = 'kg123'
    mockCore.isRepository = false
    mockCore.role = 'admin'
    mockCore.description = undefined
    mockCore.tags = undefined
    mockSDK.getGraphs.mockImplementation(async () => ({
      data: {
        graphs: [
          {
            graphId: 'kg123',
            graphName: 'Test Graph',
            role: mockCore.role,
            isRepository: mockCore.isRepository,
            createdAt: '2026-01-01T00:00:00Z',
            description: mockCore.description,
            tags: mockCore.tags,
          },
        ],
      },
    }))
    mockSDK.getGraphMetrics.mockResolvedValue({
      data: { total_nodes: 1, total_relationships: 1 },
    })
  })

  it('offers member management to a graph admin', async () => {
    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /members/i })
      ).toBeInTheDocument()
    })
  })

  it('hides member management from non-admins', async () => {
    mockCore.role = 'member'

    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Graph' })
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /members/i })
    ).not.toBeInTheDocument()
  })

  it('hides member management on shared repositories', async () => {
    mockCore.isRepository = true

    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Graph' })
      ).toBeInTheDocument()
    })
    // Subscription-based access — there is no member list to manage.
    expect(
      screen.queryByRole('button', { name: /members/i })
    ).not.toBeInTheDocument()
  })

  it('offers metadata editing to a graph admin', async () => {
    render(<GraphDashboardContent />)

    const edit = await screen.findByRole('button', { name: /edit/i })
    expect(screen.queryByTestId('metadata-modal')).not.toBeInTheDocument()

    edit.click()

    await waitFor(() => {
      expect(screen.getByTestId('metadata-modal')).toBeInTheDocument()
    })
  })

  it('hides metadata editing from non-admins', async () => {
    mockCore.role = 'member'

    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Graph' })
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /edit/i })
    ).not.toBeInTheDocument()
  })

  it('hides metadata editing on shared repositories', async () => {
    mockCore.isRepository = true

    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Graph' })
      ).toBeInTheDocument()
    })
    // Repository labels are platform-managed — update-graph-metadata 403s.
    expect(
      screen.queryByRole('button', { name: /edit/i })
    ).not.toBeInTheDocument()
  })

  it('renders the description and tags when set', async () => {
    mockCore.description = 'Primary operating entity'
    mockCore.tags = ['consulting', 'production']

    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(screen.getByText('Primary operating entity')).toBeInTheDocument()
    })
    expect(screen.getByText('consulting')).toBeInTheDocument()
    expect(screen.getByText('production')).toBeInTheDocument()
  })

  it('omits the description and tags rows when unset', async () => {
    render(<GraphDashboardContent />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Graph' })
      ).toBeInTheDocument()
    })
    expect(screen.queryByText('Description')).not.toBeInTheDocument()
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
  })
})
