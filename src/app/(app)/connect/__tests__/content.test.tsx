import { useGraphContext } from '@robosystems/core'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ConnectContent } from '../content'

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock('react-icons/hi', () => ({
  HiCheck: () => <span>Icon</span>,
  HiClipboardCopy: () => <span>Icon</span>,
  HiInformationCircle: () => <span>Icon</span>,
  HiLink: () => <span>Icon</span>,
  HiPuzzle: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Card: ({ children }: any) => <div>{children}</div>,
}))

const mockUseGraphContext = vi.mocked(useGraphContext)

const setGraphs = (graphs: any[], currentGraphId: string | null = null) => {
  mockUseGraphContext.mockReturnValue({
    state: { graphs, currentGraphId, isLoading: false, error: null },
  } as any)
}

describe('ConnectContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders one connector block per graph, anchored by graph id', () => {
    setGraphs(
      [
        { graphId: 'sec', graphName: 'SEC Repository', isRepository: true },
        { graphId: 'kg1a2b3c', graphName: 'Acme Ledger' },
      ],
      'kg1a2b3c'
    )

    render(<ConnectContent />)

    expect(screen.getByText('SEC Repository')).toBeInTheDocument()
    expect(screen.getByText('Acme Ledger')).toBeInTheDocument()

    // The graph id is in the URL path, so each connector reaches exactly one
    // graph — this is the guarantee the page exists to make visible.
    const body = document.body.textContent ?? ''
    expect(body).toContain('https://api.robosystems.ai/v1/graphs/sec/mcp')
    expect(body).toContain('https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp')
    expect(body).toContain('X-API-Key')

    // Connector names carry the id so multiple graphs do not collide.
    expect(body).toContain('robosystems-sec')
    expect(body).toContain('robosystems-kg1a2b3c')
  })

  test('does not advertise the npx stdio recipe', () => {
    setGraphs([{ graphId: 'sec', graphName: 'SEC Repository' }])

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).not.toContain('mcpServers')
    expect(body).not.toContain('npx')
    expect(body).not.toContain('ROBOSYSTEMS_GRAPH_ID')
  })

  test('shows the empty state when the user has no graphs', () => {
    setGraphs([])

    render(<ConnectContent />)

    expect(screen.getByTestId('empty-state')).toHaveTextContent('No graphs yet')
  })
})
