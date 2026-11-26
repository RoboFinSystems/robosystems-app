import { listSubgraphs } from '@robosystems/client'
import { createMcpConnectorUrl, useGraphContext } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ConnectContent } from '../content'

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  createMcpConnectorUrl: vi.fn(),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title, subtitle }: any) => (
    <>
      <h1>{title}</h1>
      <div>{subtitle}</div>
    </>
  ),
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

vi.mock('@robosystems/core/ui', () => ({
  Radio: ({ id, checked, onChange }: any) => (
    <input type="radio" id={id} checked={checked} onChange={onChange} />
  ),
  Tabs: Object.assign(({ children }: any) => <div>{children}</div>, {
    Item: ({ title, children }: any) => (
      <div>
        <span>{title}</span>
        {children}
      </div>
    ),
  }),
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

const UNIVERSAL = 'https://api.robosystems.ai/v1/mcp'
const ROBOLEDGER = 'https://api.robosystems.ai/v1/mcp/roboledger'
const ACME = 'https://api.robosystems.ai/v1/graphs/kg1a2b3c/mcp'

const acme = (extra: Record<string, unknown> = {}) => [
  { graphId: 'kg1a2b3c', graphName: 'Acme Ledger', ...extra },
]

const connectText = () =>
  screen.getByTestId('connect-section').textContent ?? ''
const developerText = () =>
  screen.getByTestId('developer-section').textContent ?? ''
const bridgeText = () => screen.getByTestId('bridge-section').textContent ?? ''

const pinToWorkspace = () =>
  fireEvent.click(document.getElementById('mcp-reach-workspace')!)

const generatedKey = (graphId: string, keyName: string) => ({
  url: `https://api.robosystems.ai/v1/graphs/${graphId}/mcp?token=rfsc_test`,
  endpoint: `https://api.robosystems.ai/v1/graphs/${graphId}/mcp`,
  apiKey: 'rfsc_test',
  keyName,
  graphId,
})

describe('ConnectContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('workspace')
    setSubgraphs([])
  })

  it('sends someone who needs the detail to the connect guide', () => {
    setGraphs(acme(), 'kg1a2b3c')

    render(<ConnectContent />)

    expect(
      screen.getByRole('link', { name: /Read the guide/ })
    ).toHaveAttribute('href', '/docs/guides/connect-an-mcp-client')
  })

  describe('Connect', () => {
    test('leads with the one address, chosen at sign-in', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-any')).toBeChecked()
      const connect = connectText()
      expect(connect).toContain(
        `claude mcp add --transport http robosystems ${UNIVERSAL}`
      )
      expect(connect).toContain(`"robosystems": { "url": "${UNIVERSAL}" }`)
      // The graph's own address is a choice, not something shown beside it.
      expect(connect).not.toContain(ACME)
    })

    test('shows one address at a time, whichever is chosen', () => {
      setGraphs(acme({ schemaExtensions: ['roboledger'] }), 'kg1a2b3c')

      render(<ConnectContent />)

      pinToWorkspace()
      expect(connectText()).toContain(
        `claude mcp add --transport http robosystems-kg1a2b3c ${ACME}`
      )
      expect(connectText()).not.toContain(`robosystems ${UNIVERSAL}`)

      fireEvent.click(document.getElementById('mcp-reach-roboledger')!)
      expect(connectText()).toContain(
        `claude mcp add --transport http roboledger ${ROBOLEDGER}`
      )
      expect(connectText()).not.toContain(ACME)
    })

    test('puts the Connect card ahead of the developer card', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      const connect = screen.getByTestId('connect-section')
      const developer = screen.getByTestId('developer-section')
      expect(
        connect.compareDocumentPosition(developer) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })

    test('never pairs a sign-in address with an API key', async () => {
      setGraphs(acme({ schemaExtensions: ['roboledger'] }), 'kg1a2b3c')
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey('kg1a2b3c', 'MCP connector - Acme Ledger')
      )

      render(<ConnectContent />)
      fireEvent.click(screen.getByText('Generate connector key'))
      await waitFor(() => expect(developerText()).toContain('rfsc_test'))

      for (const reach of ['any', 'workspace', 'roboledger']) {
        fireEvent.click(document.getElementById(`mcp-reach-${reach}`)!)
        expect(connectText()).not.toContain('rfsc_test')
        expect(connectText()).not.toContain('X-API-Key')
      }
    })

    test('names the SEC listings on the general address only', () => {
      setGraphs(acme({ schemaExtensions: ['roboledger'] }), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(connectText()).toContain('RoboSystems SEC')
      expect(connectText()).toContain('RoboSystems plugin')

      pinToWorkspace()
      expect(connectText()).not.toContain('RoboSystems SEC')

      fireEvent.click(document.getElementById('mcp-reach-roboledger')!)
      expect(connectText()).not.toContain('RoboSystems SEC')
      expect(connectText()).not.toContain('RoboSystems plugin')
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

      const body = document.body.textContent ?? ''
      expect(body).toContain('Only Acme Ledger')
      expect(body).not.toContain('SEC Repository')
      expect(body).toContain(ACME)
      expect(body).not.toContain('https://api.robosystems.ai/v1/graphs/sec/mcp')
      expect(body).toContain('robosystems-kg1a2b3c')
    })

    test('prompts for a selection when graphs exist but none is selected', () => {
      setGraphs(acme(), null)

      render(<ConnectContent />)

      expect(screen.getByTestId('empty-state')).toHaveTextContent(
        'No graph selected'
      )
      // The general address needs no selection, and neither does the bridge.
      expect(connectText()).toContain(UNIVERSAL)
      expect(document.getElementById('mcp-reach-workspace')).toBeNull()
      expect(bridgeText()).toContain('@robosystems/mcp@latest')
    })

    test('shows the empty state when the user has no graphs', () => {
      setGraphs([])

      render(<ConnectContent />)

      expect(screen.getByTestId('empty-state')).toHaveTextContent(
        'No graphs yet'
      )
    })

    test('no longer tells the user to hand-edit the id into the URL', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(document.body.textContent).not.toContain('swap the id in the URL')
    })
  })

  describe('a graph of its own', () => {
    test('offers the graph and its subgraphs as targets', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      setSubgraphs([
        { graph_id: 'kg1a2b3c_entities', display_name: 'entities' },
        { graph_id: 'kg1a2b3c_dev', display_name: 'dev' },
      ])

      render(<ConnectContent />)
      pinToWorkspace()

      await waitFor(() => {
        expect(screen.getByText('entities — subgraph')).toBeInTheDocument()
      })
      expect(screen.getByText('dev — subgraph')).toBeInTheDocument()
      expect(screen.getByText('Acme Ledger — parent graph')).toBeInTheDocument()
    })

    test('re-addresses every snippet to the selected subgraph', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      setSubgraphs([
        { graph_id: 'kg1a2b3c_entities', display_name: 'entities' },
      ])

      render(<ConnectContent />)
      pinToWorkspace()
      await waitFor(() => {
        expect(screen.getByText('entities — subgraph')).toBeInTheDocument()
      })

      fireEvent.change(document.getElementById('mcp-workspace')!, {
        target: { value: 'kg1a2b3c_entities' },
      })

      const subgraphUrl =
        'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp'
      expect(connectText()).toContain(subgraphUrl)
      expect(connectText()).toContain('robosystems-kg1a2b3c_entities')
      expect(connectText()).not.toContain(`${ACME}`)
      const scripts = screen.getByTestId('api-key-section').textContent ?? ''
      expect(scripts).toContain(subgraphUrl)
      expect(scripts).not.toContain(`${ACME}`)
    })

    test('honors a ?workspace= deep link before the subgraph list resolves', () => {
      mockSearchParams.set('workspace', 'kg1a2b3c_entities')
      mockListSubgraphs.mockReturnValue(new Promise(() => {}) as any)
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-workspace')).toBeChecked()
      expect(connectText()).toContain(
        'https://api.robosystems.ai/v1/graphs/kg1a2b3c_entities/mcp'
      )
      expect(connectText()).toContain('Only entities')
    })

    test('ignores a ?workspace= deep link outside the selected graph family', () => {
      mockSearchParams.set('workspace', 'kgotherxyz_entities')
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-any')).toBeChecked()
      expect(document.body.textContent).not.toContain('kgotherxyz')
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
      setGraphs(acme(), 'kg1a2b3c')
      mockListSubgraphs.mockRejectedValue(new Error('subgraphs unavailable'))

      render(<ConnectContent />)
      pinToWorkspace()

      await waitFor(() => expect(mockListSubgraphs).toHaveBeenCalled())
      expect(connectText()).toContain(ACME)
      expect(document.getElementById('mcp-workspace')).toBeNull()
    })

    test('stays pinned, to the new graph, when the graph switcher changes', async () => {
      // Deliberate: the choice is "only the selected graph", so it follows
      // the switcher, and the label and address say which graph that is.
      const graphs = [
        { graphId: 'kg1a2b3c', graphName: 'Acme Ledger' },
        { graphId: 'kg9z8y7x', graphName: 'Beta Books' },
      ]
      setGraphs(graphs, 'kg1a2b3c')
      const { rerender } = render(<ConnectContent />)
      pinToWorkspace()
      expect(connectText()).toContain(ACME)

      setGraphs(graphs, 'kg9z8y7x')
      rerender(<ConnectContent />)

      await waitFor(() => {
        expect(connectText()).toContain(
          'https://api.robosystems.ai/v1/graphs/kg9z8y7x/mcp'
        )
      })
      expect(document.getElementById('mcp-reach-workspace')).toBeChecked()
      expect(connectText()).toContain('Only Beta Books')
      expect(connectText()).not.toContain(ACME)
    })

    test('names the applications a graph brings to the connection', () => {
      setGraphs(acme({ schemaExtensions: ['roboledger'] }), 'kg1a2b3c')

      render(<ConnectContent />)

      // The Connect card says it for a reader who never pins a graph.
      expect(connectText()).toContain('RoboLedger or RoboInvestor')

      pinToWorkspace()
      const target = screen.getByTestId('workspace-target').textContent ?? ''
      expect(target).toContain('RoboLedger')
      expect(target).toContain('period close')
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
      pinToWorkspace()

      const target = screen.getByTestId('workspace-target').textContent ?? ''
      expect(target).toContain('RoboLedger and RoboInvestor')
      expect(target).toContain('securities registry')
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
      pinToWorkspace()

      const target = screen.getByTestId('workspace-target').textContent ?? ''
      expect(target).toContain('read-only')
      expect(target).not.toContain('journal entries')
    })

    test('stays silent on a graph with no application schema', () => {
      setGraphs(acme({ schemaExtensions: [] }), 'kg1a2b3c')

      render(<ConnectContent />)
      pinToWorkspace()

      const target = screen.getByTestId('workspace-target').textContent ?? ''
      expect(target).not.toContain('Runs')
      expect(target).not.toContain('read-only')
    })
  })

  describe('the RoboLedger address', () => {
    test('is offered when a graph runs RoboLedger', () => {
      setGraphs(
        [
          { graphId: 'kgplain', graphName: 'Plain Graph' },
          {
            graphId: 'kg1a2b3c',
            graphName: 'Acme Ledger',
            schemaExtensions: ['roboledger'],
          },
        ],
        'kgplain'
      )

      render(<ConnectContent />)

      // It follows whether the user has an eligible graph at all, not the
      // graph the switcher is on.
      expect(document.getElementById('mcp-reach-roboledger')).not.toBeNull()
    })

    test('is not offered without a RoboLedger graph', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-roboledger')).toBeNull()
      expect(document.body.textContent).not.toContain(ROBOLEDGER)
    })

    test('is kept away from a subgraph and a shared repository', () => {
      // The address refuses both at consent, so neither makes a user eligible.
      setGraphs(
        [
          {
            graphId: 'sec',
            graphName: 'SEC Repository',
            isRepository: true,
            schemaExtensions: ['roboledger'],
          },
          {
            graphId: 'kg1a2b3c_dev',
            graphName: 'dev',
            isSubgraph: true,
            schemaExtensions: ['roboledger'],
          },
        ],
        'sec'
      )

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-roboledger')).toBeNull()
    })

    test('is hidden while a shared repository is selected', () => {
      // Beside the SEC repository it reads as a way to reach it, which it is not.
      setGraphs(
        [
          {
            graphId: 'sec',
            graphName: 'SEC Repository',
            isRepository: true,
          },
          {
            graphId: 'kg1a2b3c',
            graphName: 'Acme Ledger',
            schemaExtensions: ['roboledger'],
          },
        ],
        'sec'
      )

      render(<ConnectContent />)

      expect(document.getElementById('mcp-reach-roboledger')).toBeNull()
    })
  })

  describe('For developers', () => {
    test('offers the bridge with an account key and no graph list', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      const bridge = bridgeText()
      expect(bridge).toContain('npx -y @robosystems/mcp@latest')
      expect(bridge).toContain('"ROBOSYSTEMS_API_KEY": "<your key>"')
      expect(bridge).not.toContain('ROBOSYSTEMS_GRAPH_IDS')
      expect(bridge).toContain('Settings → API Keys')
      // The command is per project unless told otherwise.
      expect(bridge).toContain('--scope user')
      expect(
        screen.getByRole('link', { name: /Bridge reference/ })
      ).toHaveAttribute('href', '/docs/technical/the-mcp-bridge')
    })

    test('says a key made on the page fills the bridge snippets', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      expect(bridgeText()).toContain(
        'generate a key for Acme Ledger under Scripts and CI below'
      )
    })

    test('warns that the snippets hold a live key once one is generated', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey('kg1a2b3c', 'MCP connector - Acme Ledger')
      )

      render(<ConnectContent />)
      expect(screen.queryByTestId('key-notice')).toBeNull()

      fireEvent.click(screen.getByText('Generate connector key'))

      await waitFor(() => {
        expect(screen.getByTestId('key-notice')).toHaveTextContent(
          'Treat anything you copy from them as a secret'
        )
      })
    })

    test('keeps the scripts and CI route collapsed', () => {
      setGraphs(acme(), 'kg1a2b3c')

      render(<ConnectContent />)

      const scripts = screen.getByTestId(
        'api-key-section'
      ) as HTMLDetailsElement
      expect(scripts.open).toBe(false)
      expect(scripts.textContent).toContain('Generate connector key')
    })

    test('fills every key snippet with the generated key', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey('kg1a2b3c', 'MCP connector - Acme Ledger')
      )

      render(<ConnectContent />)

      // Placeholders before generation — no real credential anywhere.
      expect(developerText()).toContain('<your key>')
      expect(document.body.textContent).not.toContain('rfsc_test')

      fireEvent.click(screen.getByText('Generate connector key'))

      await waitFor(() => {
        expect(developerText()).toContain('X-API-Key: rfsc_test')
      })

      // The key lands in every snippet that takes one, so every copy button
      // yields a working artifact — and never in a URL: the ?token= carriage
      // was retired once OAuth covered header-less clients.
      const developer = developerText()
      expect(developer).toContain('"X-API-Key": "rfsc_test"')
      expect(developer).toContain('"ROBOSYSTEMS_API_KEY": "rfsc_test"')
      expect(developer).toContain('-e ROBOSYSTEMS_API_KEY=rfsc_test')
      expect(developer).not.toContain('<your key>')
      expect(document.body.textContent).not.toContain('?token=')

      expect(mockCreateMcpConnectorUrl).toHaveBeenCalledWith(
        'kg1a2b3c',
        expect.objectContaining({ name: 'MCP connector - Acme Ledger' })
      )
    })

    test('tells the bridge which graph a scoped key is for', async () => {
      // A key made here cannot list the account, so the bridge needs the graph.
      setGraphs(acme(), 'kg1a2b3c')
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey('kg1a2b3c', 'MCP connector - Acme Ledger')
      )

      render(<ConnectContent />)
      fireEvent.click(screen.getByText('Generate connector key'))

      await waitFor(() => {
        expect(bridgeText()).toContain('-e ROBOSYSTEMS_GRAPH_IDS=kg1a2b3c')
      })
      expect(bridgeText()).toContain('"ROBOSYSTEMS_GRAPH_IDS": "kg1a2b3c"')
      expect(bridgeText()).toContain('and its subgraphs')
    })

    test('scopes the generated key to the selected subgraph', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      setSubgraphs([
        { graph_id: 'kg1a2b3c_entities', display_name: 'entities' },
      ])
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey(
          'kg1a2b3c_entities',
          'MCP connector - Acme Ledger / entities'
        )
      )

      render(<ConnectContent />)
      pinToWorkspace()
      await waitFor(() => {
        expect(screen.getByText('entities — subgraph')).toBeInTheDocument()
      })
      fireEvent.change(document.getElementById('mcp-workspace')!, {
        target: { value: 'kg1a2b3c_entities' },
      })

      // A parent's key already covers the subgraph, and the page says so.
      expect(screen.getByTestId('api-key-section').textContent).toContain(
        'It covers this subgraph too'
      )

      fireEvent.click(screen.getByText('Generate connector key'))

      await waitFor(() => {
        expect(mockCreateMcpConnectorUrl).toHaveBeenCalledWith(
          'kg1a2b3c_entities',
          expect.objectContaining({
            name: 'MCP connector - Acme Ledger / entities',
          })
        )
      })
      await waitFor(() => {
        expect(bridgeText()).toContain(
          '"ROBOSYSTEMS_GRAPH_IDS": "kg1a2b3c_entities"'
        )
      })
    })

    test('drops a generated key when the workspace changes', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      setSubgraphs([
        { graph_id: 'kg1a2b3c_entities', display_name: 'entities' },
      ])
      mockCreateMcpConnectorUrl.mockResolvedValue(
        generatedKey('kg1a2b3c', 'MCP connector - Acme Ledger')
      )

      render(<ConnectContent />)
      pinToWorkspace()
      await waitFor(() => {
        expect(screen.getByText('entities — subgraph')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Generate connector key'))
      await waitFor(() => expect(developerText()).toContain('rfsc_test'))

      fireEvent.change(document.getElementById('mcp-workspace')!, {
        target: { value: 'kg1a2b3c_entities' },
      })

      expect(document.body.textContent).not.toContain('rfsc_test')
      expect(developerText()).toContain('<your key>')
    })

    test('surfaces an error when key generation fails', async () => {
      setGraphs(acme(), 'kg1a2b3c')
      mockCreateMcpConnectorUrl.mockRejectedValue(
        new Error('key limit reached')
      )

      render(<ConnectContent />)
      fireEvent.click(screen.getByText('Generate connector key'))

      await waitFor(() => {
        expect(screen.getByText('key limit reached')).toBeInTheDocument()
      })
    })
  })
})
