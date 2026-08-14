import {
  useGraphContext,
  useOrg,
  useUser,
  useUserLimits,
} from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { NewGraphContent } from '../content'

const mockGraphCreationPage = vi.hoisted(() =>
  vi.fn(
    ({
      onSuccess,
      backUrl,
      title,
    }: {
      onSuccess: (graphId: string) => void
      backUrl: string
      title: string
    }) => (
      <div>
        <h1>{title}</h1>
        <p>Back URL: {backUrl}</p>
        <button onClick={() => onSuccess('test-graph-id')}>
          Create Test Graph
        </button>
      </div>
    )
  )
)

vi.mock('@/components/graphs/creation', () => ({
  GraphCreationPage: mockGraphCreationPage,
}))

const mockGraphLimitModal = vi.hoisted(() =>
  vi.fn(() => <div>Graph Limit Modal</div>)
)

vi.mock('@/components/app/GraphLimitModal', () => ({
  __esModule: true,
  default: mockGraphLimitModal,
}))

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  // Graph creation is owner/admin-only, so the existing suite represents an
  // admin — the role it implicitly assumed when creation was open to everyone.
  useOrg: vi.fn(() => ({
    currentOrg: { id: 'org_test123', role: 'admin' },
  })),
  useUser: vi.fn(),
  useUserLimits: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const mockUseOrg = vi.mocked(useOrg)
const mockUseGraphContext = vi.mocked(useGraphContext)
const mockUseUser = vi.mocked(useUser)
const mockUseUserLimits = vi.mocked(useUserLimits)
const mockUseRouter = vi.mocked(useRouter)

describe('NewGraphContent', () => {
  const mockPush = vi.fn()
  const mockReplace = vi.fn()
  const mockRefresh = vi.fn()
  const mockSetCurrentGraph = vi.fn()
  const mockRefreshGraphs = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGraphCreationPage.mockImplementation(
      ({
        onSuccess,
        backUrl,
        title,
      }: {
        onSuccess: (graphId: string) => void
        backUrl: string
        title: string
      }) => (
        <div>
          <h1>{title}</h1>
          <p>Back URL: {backUrl}</p>
          <button onClick={() => onSuccess('test-graph-id')}>
            Create Test Graph
          </button>
        </div>
      )
    )

    mockUseGraphContext.mockReturnValue({
      setCurrentGraph: mockSetCurrentGraph,
      refreshGraphs: mockRefreshGraphs,
    })

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
    })

    mockUseUser.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    })

    mockUseUserLimits.mockReturnValue({
      limits: { max_graphs: 10 },
      remainingGraphs: 7,
      canCreateGraph: true,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  test('renders GraphCreationPage with correct props', () => {
    render(<NewGraphContent />)

    expect(screen.getByText('Create New Knowledge Graph')).toBeInTheDocument()
    expect(screen.getByText('Back URL: /dashboard')).toBeInTheDocument()
    expect(screen.getByText('Create Test Graph')).toBeInTheDocument()
  })

  test('handles successful graph creation', async () => {
    render(<NewGraphContent />)

    fireEvent.click(screen.getByText('Create Test Graph'))

    await waitFor(() => {
      expect(mockRefreshGraphs).toHaveBeenCalled()
    })

    expect(mockSetCurrentGraph).toHaveBeenCalledWith('test-graph-id')
    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    expect(mockRefresh).toHaveBeenCalled()
  })

  test('handles graph creation without graphId', async () => {
    mockGraphCreationPage.mockImplementationOnce(
      ({ onSuccess }: { onSuccess: (graphId: string) => void }) => (
        <button onClick={() => onSuccess('')}>Create Without ID</button>
      )
    )

    render(<NewGraphContent />)

    fireEvent.click(screen.getByText('Create Without ID'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    expect(mockRefreshGraphs).not.toHaveBeenCalled()
    expect(mockSetCurrentGraph).not.toHaveBeenCalled()
  })

  test('handles errors during graph creation', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockRefreshGraphs.mockRejectedValue(new Error('Test error'))

    render(<NewGraphContent />)

    fireEvent.click(screen.getByText('Create Test Graph'))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to select new graph:',
        expect.any(Error)
      )
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    consoleErrorSpy.mockRestore()
  })

  describe('Boundary Conditions', () => {
    test('shows limit modal when at graph limit (remainingGraphs = 0)', () => {
      mockUseUserLimits.mockReturnValue({
        limits: { max_graphs: 5 },
        remainingGraphs: 0,
        canCreateGraph: false,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Graph Limit Modal')).toBeInTheDocument()
    })

    test('allows creation when exactly 1 graph remaining', () => {
      mockUseUserLimits.mockReturnValue({
        limits: { max_graphs: 5 },
        remainingGraphs: 1,
        canCreateGraph: true,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Create New Knowledge Graph')).toBeInTheDocument()
      expect(screen.queryByText('Graph Limit Modal')).not.toBeInTheDocument()
    })

    test('does not show a limit banner when low on remaining graphs', () => {
      mockUseUserLimits.mockReturnValue({
        limits: { max_graphs: 10 },
        remainingGraphs: 3,
        canCreateGraph: true,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Create New Knowledge Graph')).toBeInTheDocument()
      expect(screen.queryByText('Graph Limit Modal')).not.toBeInTheDocument()
      expect(
        screen.queryByText('remaining in your limit.', { exact: false })
      ).not.toBeInTheDocument()
    })

    test('handles negative remainingGraphs gracefully', () => {
      mockUseUserLimits.mockReturnValue({
        limits: { max_graphs: 5 },
        remainingGraphs: -1,
        canCreateGraph: false,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Graph Limit Modal')).toBeInTheDocument()
    })

    test('handles unlimited graphs (very high limit)', () => {
      mockUseUserLimits.mockReturnValue({
        limits: { max_graphs: 999999 },
        remainingGraphs: 999990,
        canCreateGraph: true,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Create New Knowledge Graph')).toBeInTheDocument()
      expect(screen.queryByText('Graph Limit Modal')).not.toBeInTheDocument()
    })

    test('handles loading state correctly', () => {
      mockUseUserLimits.mockReturnValue({
        limits: null,
        remainingGraphs: 0,
        canCreateGraph: false,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('handles error state when limits fail to load', () => {
      mockUseUserLimits.mockReturnValue({
        limits: null,
        remainingGraphs: 0,
        canCreateGraph: false,
        isLoading: false,
        error: 'Failed to load limits',
        refetch: vi.fn(),
      })

      render(<NewGraphContent />)

      expect(screen.getByText('Graph Limit Modal')).toBeInTheDocument()
    })
  })
})

describe('NewGraphContent role restriction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
    } as never)
    mockUseUser.mockReturnValue({ user: { email: 'a@b.c' } } as never)
    mockUseGraphContext.mockReturnValue({
      setCurrentGraph: vi.fn(),
      refreshGraphs: vi.fn(),
    } as never)
  })

  test('sends a member to their org rather than to the limit form', () => {
    mockUseOrg.mockReturnValue({
      currentOrg: { id: 'org_1', role: 'member' },
    } as never)
    // The API reports the role refusal through the same flag as a quota
    // refusal, which is exactly why the page must not treat them alike.
    mockUseUserLimits.mockReturnValue({
      canCreateGraph: false,
      isLoading: false,
      limits: { max_graphs: 10 },
    } as never)

    render(<NewGraphContent />)

    expect(
      screen.getByText(/Graph Creation Is Restricted/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/owners and admins/i)).toBeInTheDocument()
    // The request-a-higher-limit path asks RoboSystems to raise a quota, which
    // is not what blocked them.
    expect(
      screen.queryByText(/Request a higher limit/i)
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Request access/i)).not.toBeInTheDocument()
  })

  test('still shows the limit path to an admin at quota', () => {
    mockUseOrg.mockReturnValue({
      currentOrg: { id: 'org_1', role: 'admin' },
    } as never)
    mockUseUserLimits.mockReturnValue({
      canCreateGraph: false,
      isLoading: false,
      limits: { max_graphs: 3 },
    } as never)

    render(<NewGraphContent />)

    expect(
      screen.queryByText(/Graph Creation Is Restricted/i)
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/Graph Creation Limit Reached/i)
    ).toBeInTheDocument()
  })

  test('shows a spinner, not the member dead-end, while org context loads (F8)', () => {
    // An owner whose org context has not resolved yet has currentOrg=null, so
    // isOrgAdmin is false. Gating only on useUserLimits.isLoading let the page
    // fall through to the member "Graph Creation Is Restricted" dead-end before
    // the role arrived — an owner briefly told they are a member.
    mockUseOrg.mockReturnValue({
      currentOrg: null,
      loading: true,
    } as never)
    mockUseUserLimits.mockReturnValue({
      canCreateGraph: false,
      isLoading: false,
      limits: { max_graphs: 10 },
    } as never)

    render(<NewGraphContent />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.queryByText(/Graph Creation Is Restricted/i)
    ).not.toBeInTheDocument()
  })
})
