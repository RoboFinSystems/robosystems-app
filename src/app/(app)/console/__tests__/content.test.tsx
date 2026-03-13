import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryInterfaceContent } from '../content'

const mockUseGraphContext = vi.fn()
const mockUseIsRepository = vi.fn()

vi.mock('@/lib/core', async () => {
  const actual = await vi.importActual('@/lib/core')
  return {
    ...actual,
    ConsoleContent: vi.fn(({ config }) => (
      <div data-testid="console-content" data-config={JSON.stringify(config)}>
        <h1>{config.header.title}</h1>
      </div>
    )),
    customTheme: { card: {} },
    useGraphContext: (...args: any[]) => mockUseGraphContext(...args),
    useIsRepository: (...args: any[]) => mockUseIsRepository(...args),
  }
})

vi.mock('@/lib/core/hooks', () => ({
  useStreamingQuery: vi.fn(() => ({
    executeQuery: vi.fn(),
    cancelQuery: vi.fn(),
    reset: vi.fn(),
    isStreaming: false,
    status: 'idle',
    results: [],
    error: null,
    creditsUsed: null,
  })),
}))

describe('QueryInterfaceContent', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      writable: true,
      value: vi.fn(),
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: generic graph with no extensions
    mockUseGraphContext.mockReturnValue({
      state: {
        graphs: [{ graphId: 'test-graph-id', graphName: 'Test Graph' }],
        isLoading: false,
        currentGraphId: 'test-graph-id',
      },
      loadGraphs: vi.fn(),
      setCurrentGraph: vi.fn(),
      refreshGraphs: vi.fn(),
    })
    mockUseIsRepository.mockReturnValue({
      isRepository: false,
      currentGraph: { graphId: 'test-graph-id', graphName: 'Test Graph' },
      graphType: 'graph',
    })
  })

  it('should render ConsoleContent with RoboSystems config', () => {
    render(<QueryInterfaceContent />)

    const consoleContent = screen.getByTestId('console-content')
    const config = JSON.parse(consoleContent.getAttribute('data-config')!)

    expect(config.header.title).toBe('Console')
    expect(config.welcome.consoleName).toBe('RoboSystems Console')
    expect(config.mcp.serverName).toBe('robosystems')
    expect(config.mcp.packageName).toBe('@robosystems/mcp')
    expect(config.examplesLabel).toBe('Example Cypher Queries:')
    expect(config.noSelectionError).toBe(
      'No graph selected. Please select a graph first.'
    )
  })

  it('should show generic config for graph without schema extensions', () => {
    render(<QueryInterfaceContent />)

    const consoleContent = screen.getByTestId('console-content')
    const config = JSON.parse(consoleContent.getAttribute('data-config')!)

    expect(config.header.subtitle).toBe(
      'Text-to-Cypher for your graph database'
    )
    expect(config.welcome.contextLabel).toBe('Graph')
    expect(config.sampleQueries[0].name).toBe('Graph overview')
  })

  it('should show SEC config for SEC repository', () => {
    mockUseIsRepository.mockReturnValue({
      isRepository: true,
      currentGraph: {
        graphId: 'sec-graph',
        graphName: 'SEC Repository',
        isRepository: true,
        repositoryType: 'sec',
      },
      graphType: 'repository',
    })

    render(<QueryInterfaceContent />)

    const consoleContent = screen.getByTestId('console-content')
    const config = JSON.parse(consoleContent.getAttribute('data-config')!)

    expect(config.header.subtitle).toBe(
      'Text-to-Cypher for SEC financial filings'
    )
    expect(config.welcome.contextLabel).toBe('Repository')
    expect(config.sampleQueries.length).toBe(7)
    expect(
      config.sampleQueries.some((q: any) => q.name === 'Recent SEC filings')
    ).toBe(true)
  })

  it('should show RoboLedger config for graph with roboledger extension', () => {
    mockUseIsRepository.mockReturnValue({
      isRepository: false,
      currentGraph: {
        graphId: 'ledger-graph',
        graphName: 'My Company',
        schemaExtensions: ['roboledger'],
      },
      graphType: 'graph',
    })

    render(<QueryInterfaceContent />)

    const consoleContent = screen.getByTestId('console-content')
    const config = JSON.parse(consoleContent.getAttribute('data-config')!)

    expect(config.header.subtitle).toBe(
      'Text-to-Cypher for your financial data'
    )
    expect(config.welcome.contextLabel).toBe('Graph')
    expect(
      config.sampleQueries.some((q: any) => q.name === 'Recent transactions')
    ).toBe(true)
  })

  it('should include sample queries', () => {
    render(<QueryInterfaceContent />)

    const consoleContent = screen.getByTestId('console-content')
    const config = JSON.parse(consoleContent.getAttribute('data-config')!)

    expect(config.sampleQueries.length).toBeGreaterThan(0)
    expect(config.sampleQueries[0].name).toBe('Graph overview')
  })
})
