import { createMcpConnectorUrl, useGraphContext } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ConnectContent } from '../content'

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  createMcpConnectorUrl: vi.fn(),
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
  HiSparkles: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Card: ({ children }: any) => <div>{children}</div>,
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockCreateMcpConnectorUrl = vi.mocked(createMcpConnectorUrl)

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

  test('generates a graph-scoped connector URL for Claude on demand', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }])
    mockCreateMcpConnectorUrl.mockResolvedValue({
      url: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test',
      endpoint: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp',
      apiKey: 'rfsc_test',
      keyName: 'Claude connector - Acme Ledger',
      graphId: 'kg1a2b3c',
    })

    render(<ConnectContent />)

    // Before generation the token URL must not exist anywhere.
    expect(document.body.textContent).not.toContain('?token=')

    fireEvent.click(screen.getByText('Generate connector URL'))

    await waitFor(() => {
      expect(document.body.textContent).toContain(
        'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test'
      )
    })

    // The mint is graph-scoped — that is what makes URL carriage acceptable.
    expect(mockCreateMcpConnectorUrl).toHaveBeenCalledWith(
      'kg1a2b3c',
      expect.objectContaining({ name: 'Claude connector - Acme Ledger' })
    )
    expect(document.body.textContent).toContain('treat it like a password')
  })

  test('surfaces an error when connector generation fails', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }])
    mockCreateMcpConnectorUrl.mockRejectedValue(new Error('nope'))

    render(<ConnectContent />)
    fireEvent.click(screen.getByText('Generate connector URL'))

    await waitFor(() => {
      expect(screen.getByText('nope')).toBeInTheDocument()
    })
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
