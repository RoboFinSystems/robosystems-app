import { listSubgraphs } from '@robosystems/client'
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

const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
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
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Select: ({ children, value, onChange, id }: any) => (
    <select id={id} value={value} onChange={onChange}>
      {children}
    </select>
  ),
}))

const mockUseGraphContext = vi.mocked(useGraphContext)
const mockCreateMcpConnectorUrl = vi.mocked(createMcpConnectorUrl)
const mockListSubgraphs = vi.mocked(listSubgraphs)

const setGraphs = (graphs: any[], currentGraphId: string | null = null) => {
  mockUseGraphContext.mockReturnValue({
    state: { graphs, currentGraphId, isLoading: false, error: null },
  } as any)
}

const setSubgraphs = (subgraphs: any[]) => {
  mockListSubgraphs.mockResolvedValue({ data: { subgraphs } } as any)
}

describe('ConnectContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('workspace')
    setSubgraphs([])
  })

  test('renders only the selected graph, not the whole list', async () => {
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
      expect(document.body.textContent).toContain('X-API-Key: rfsc_test')
    })

    // The key lands in every header-based snippet, so every copy button
    // yields a working artifact — and never in a URL: the ?token= carriage
    // was retired once OAuth covered header-less clients.
    const body = document.body.textContent ?? ''
    expect(body).toContain('"X-API-Key": "rfsc_test"')
    expect(body).not.toContain('<your key>')
    expect(body).not.toContain('?token=')

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
    // The universal URL needs no selection — it stays connectable regardless.
    expect(screen.getByTestId('universal-section').textContent).toContain(
      'https://api.robosystems.ai/v1/mcp'
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

  test('offers the graph and its subgraphs as connector targets', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    setSubgraphs([
      {
        graph_id: 'kg1a2b3c_entities',
        subgraph_name: 'entities',
        display_name: 'Related Entities',
      },
    ])

    render(<ConnectContent />)

    await waitFor(() => {
      expect(
        screen.getByText(/Related Entities — subgraph/)
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/Acme Ledger — parent graph/)).toBeInTheDocument()
  })

  test('re-addresses every snippet to the selected subgraph', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    setSubgraphs([
      {
        graph_id: 'kg1a2b3c_entities',
        subgraph_name: 'entities',
        display_name: 'Related Entities',
      },
    ])

    render(<ConnectContent />)

    await waitFor(() => {
      expect(screen.getByLabelText('Workspace')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Workspace'), {
      target: { value: 'kg1a2b3c_entities' },
    })

    const body = document.body.textContent ?? ''
    expect(body).toContain(
      'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp'
    )
    // The connector name follows the target, not the parent — a subgraph
    // connector labeled with its parent's id is how they got confused.
    expect(body).toContain('robosystems-kg1a2b3c_entities')
    expect(body).not.toContain('"robosystems-kg1a2b3c"')
  })

  test('scopes the generated key to the selected subgraph', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    setSubgraphs([
      {
        graph_id: 'kg1a2b3c_entities',
        subgraph_name: 'entities',
        display_name: 'Related Entities',
      },
    ])
    mockCreateMcpConnectorUrl.mockResolvedValue({
      url: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp?token=rfsc_sub',
      endpoint: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp',
      apiKey: 'rfsc_sub',
      keyName: 'Claude connector - Acme Ledger / Related Entities',
      graphId: 'kg1a2b3c_entities',
    })

    render(<ConnectContent />)

    await waitFor(() => {
      expect(screen.getByLabelText('Workspace')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText('Workspace'), {
      target: { value: 'kg1a2b3c_entities' },
    })
    fireEvent.click(screen.getByText('Generate connector key'))

    await waitFor(() => {
      expect(mockCreateMcpConnectorUrl).toHaveBeenCalledWith(
        'kg1a2b3c_entities',
        expect.objectContaining({
          name: 'Claude connector - Acme Ledger / Related Entities',
        })
      )
    })
  })

  test('honors a ?workspace= deep link before the subgraph list resolves', () => {
    mockSearchParams.set('workspace', 'kg1a2b3c_entities')
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockListSubgraphs.mockReturnValue(new Promise(() => {}) as any)

    render(<ConnectContent />)

    expect(document.body.textContent).toContain(
      'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp'
    )
  })

  test('ignores a ?workspace= deep link outside the selected graph family', () => {
    mockSearchParams.set('workspace', 'kgotherxyz_entities')
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).not.toContain('kgotherxyz')
    expect(body).toContain('https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp')
  })

  test('does not look for subgraphs on a shared repository', () => {
    setGraphs(
      [{ graphId: 'sec', graphName: 'SEC Repository', isRepository: true }],
      'sec'
    )

    render(<ConnectContent />)

    expect(mockListSubgraphs).not.toHaveBeenCalled()
  })

  test('keeps the page usable when the subgraph list fails', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockListSubgraphs.mockRejectedValue(new Error('boom'))

    render(<ConnectContent />)

    await waitFor(() => {
      expect(document.body.textContent).toContain(
        'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp'
      )
    })
    expect(screen.queryByLabelText('Workspace')).not.toBeInTheDocument()
  })

  test('leads with the universal URL, then the workspace sign-in, then the key path', () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')

    render(<ConnectContent />)

    // The universal address gets the full recipe set under the listing name,
    // not a one-line footnote — it is the URL every public listing carries.
    const universal = screen.getByTestId('universal-section').textContent ?? ''
    expect(universal).toContain(
      'claude mcp add --transport http robosystems https://api.robosystems.ai/v1/mcp'
    )
    expect(universal).toContain(
      '"robosystems": { "url": "https://api.robosystems.ai/v1/mcp" }'
    )
    expect(universal).not.toContain('/v1/graphs/')

    // The workspace recipe: same name, same URL, no header.
    const oauth = screen.getByTestId('oauth-section')
    expect(oauth.textContent).toContain(
      'claude mcp add --transport http robosystems-kg1a2b3c https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp'
    )
    expect(oauth.textContent).toContain(
      '"robosystems-kg1a2b3c": { "url": "https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp" }'
    )

    // Universal above workspace sign-in above the key path, which starts closed.
    const universalSection = screen.getByTestId('universal-section')
    const apiKey = screen.getByTestId('api-key-section') as HTMLDetailsElement
    expect(
      universalSection.compareDocumentPosition(oauth) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      oauth.compareDocumentPosition(apiKey) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(apiKey.open).toBe(false)
    expect(apiKey.textContent).toContain('Generate connector key')
  })

  test('never pairs the universal URL with an API key', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockCreateMcpConnectorUrl.mockResolvedValue({
      url: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test',
      endpoint: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp',
      apiKey: 'rfsc_test',
      keyName: 'Claude connector - Acme Ledger',
      graphId: 'kg1a2b3c',
    })

    render(<ConnectContent />)
    fireEvent.click(screen.getByText('Generate connector key'))
    await waitFor(() => {
      expect(document.body.textContent).toContain('rfsc_test')
    })

    // /v1/mcp is OAuth-only on the API, so the page must not suggest a
    // header there, and the key snippets must address a workspace URL.
    expect(screen.getByTestId('universal-section').textContent).not.toContain(
      'X-API-Key'
    )
    expect(screen.getByTestId('api-key-section').textContent).not.toContain(
      'api.robosystems.ai/v1/mcp'
    )
  })

  test('keeps the OAuth snippets credential-free after a key is generated', async () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')
    mockCreateMcpConnectorUrl.mockResolvedValue({
      url: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp?token=rfsc_test',
      endpoint: 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp',
      apiKey: 'rfsc_test',
      keyName: 'Claude connector - Acme Ledger',
      graphId: 'kg1a2b3c',
    })

    render(<ConnectContent />)
    fireEvent.click(screen.getByText('Generate connector key'))

    await waitFor(() => {
      expect(document.body.textContent).toContain('rfsc_test')
    })
    expect(screen.getByTestId('oauth-section').textContent).not.toContain(
      'rfsc_test'
    )
    expect(screen.getByTestId('universal-section').textContent).not.toContain(
      'rfsc_test'
    )
  })

  test('names the applications a graph brings to the connection', () => {
    setGraphs(
      [
        {
          graphId: 'kg1a2b3c',
          graphName: 'Acme Ledger',
          schemaExtensions: ['roboledger'],
        },
      ],
      'kg1a2b3c'
    )

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).toContain('RoboLedger')
    expect(body).toContain('period close')
    // The universal section says it too, for a reader who never scrolls.
    expect(screen.getByTestId('universal-section').textContent).toContain(
      'RoboInvestor'
    )
  })

  test('lists both applications when a graph runs both', () => {
    setGraphs(
      [
        {
          graphId: 'kg1a2b3c',
          graphName: 'Acme Holdings',
          schemaExtensions: ['roboledger', 'roboinvestor'],
        },
      ],
      'kg1a2b3c'
    )

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).toContain('RoboLedger and RoboInvestor')
    expect(body).toContain('securities registry')
  })

  test('claims no write tools on a shared repository', () => {
    setGraphs(
      [
        {
          graphId: 'sec',
          graphName: 'SEC Repository',
          isRepository: true,
          schemaExtensions: ['roboledger'],
        },
      ],
      'sec'
    )

    render(<ConnectContent />)

    const body = document.body.textContent ?? ''
    expect(body).toContain('read-only')
    expect(body).not.toContain('journal entries')
  })

  test('stays silent on a graph with no application schema', () => {
    setGraphs(
      [{ graphId: 'kg1a2b3c', graphName: 'Acme Graph', schemaExtensions: [] }],
      'kg1a2b3c'
    )

    render(<ConnectContent />)

    expect(document.body.textContent).not.toContain('Runs ')
  })

  test('no longer tells the user to hand-edit the id into the URL', () => {
    setGraphs([{ graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }], 'kg1a2b3c')

    render(<ConnectContent />)

    expect(document.body.textContent).not.toContain('swap the id in the URL')
  })
})
