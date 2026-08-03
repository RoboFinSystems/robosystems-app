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
  useGraphContext: () => ({ state: { currentGraphId: mockCore.graphId } }),
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

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('GraphDashboardContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCore.graphId = 'kg123'
    mockCore.isRepository = false
    mockCore.role = 'admin'
    mockSDK.getGraphs.mockImplementation(async () => ({
      data: {
        graphs: [
          {
            graphId: 'kg123',
            graphName: 'Test Graph',
            role: mockCore.role,
            isRepository: mockCore.isRepository,
            createdAt: '2026-01-01T00:00:00Z',
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
})
