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
  HiLink: () => <span>Icon</span>,
  HiPuzzle: () => <span>Icon</span>,
  HiSparkles: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
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

  test('renders only the selected graph, not the whole list', () => {
    setGraphs(
      [
        { graphId: 'sec', graphName: 'SEC Repository', isRepository: true },
        { graphId: 'kg1a2b3c', graphName: 'Acme Ledger' },
      ],
      'kg1a2b3c'
    )

    render(<ConnectContent />)

    expect(screen.getByText('Acme Ledger')).toBeInTheDocument()
    expect(screen.queryByText('SEC Repository')).not.toBeInTheDocument()

    const body = document.body.textContent ?? ''
    expect(body).toContain('https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp')
    expect(body).not.toContain('https://api.robosystems.ai/v1/graphs/sec/mcp')
    expect(body).toContain('robosystems-kg1a2b3c')
  })

  test('fills every snippet with the generated key', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockCreateMcpConnectorUrl.mockResolvedValue({
      url: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test',
      endpoint: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp',
      apiKey: 'rfsc_test',
      keyName: 'Claude connector - Acme Ledger',
      graphId: 'kg1a2b3c',
    })

    render(<ConnectContent />)

    // Placeholders before generation — no real credential anywhere.
    expect(document.body.textContent).toContain('<your key>')
    expect(document.body.textContent).not.toContain('rfsc_test')

    fireEvent.click(screen.getByText('Generate connector key'))

    await waitFor(() => {
      expect(document.body.textContent).toContain(
        'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test'
      )
    })

    // The same key lands in the header-based snippets too, so every copy
    // button yields a working artifact — no <your key> placeholders left.
    const body = document.body.textContent ?? ''
    expect(body).toContain('X-API-Key: rfsc_test')
    expect(body).toContain('"X-API-Key": "rfsc_test"')
    expect(body).not.toContain('<your key>')

    expect(mockCreateMcpConnectorUrl).toHaveBeenCalledWith(
      'kg1a2b3c',
      expect.objectContaining({ name: 'Claude connector - Acme Ledger' })
    )
  })

  test('surfaces an error when key generation fails', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockCreateMcpConnectorUrl.mockRejectedValue(new Error('nope'))

    render(<ConnectContent />)
    fireEvent.click(screen.getByText('Generate connector key'))

    await waitFor(() => {
      expect(screen.getByText('nope')).toBeInTheDocument()
    })
  })

  test('prompts for a selection when graphs exist but none is selected', () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], null)

    render(<ConnectContent />)

    expect(screen.getByTestId('empty-state')).toHaveTextContent(
      'No graph selected'
    )
  })

  test('shows the empty state when the user has no graphs', () => {
    setGraphs([])

    render(<ConnectContent />)

    expect(screen.getByTestId('empty-state')).toHaveTextContent('No graphs yet')
  })

  test('does not advertise the npx stdio recipe', () => {
    setGraphs([{ graphId: 'sec', graphName: 'SEC Repository' }], 'sec')

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).not.toContain('mcpServers')
    expect(body).not.toContain('npx')
    expect(body).not.toContain('ROBOSYSTEMS_GRAPH_ID')
  })
})
