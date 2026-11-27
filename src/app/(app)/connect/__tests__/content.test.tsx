import { createUserApiKey, listSubgraphs } from '@robosystems/client'
import { createMcpConnectorUrl, useGraphContext } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ConnectContent } from '../content'

vi.mock('@robosystems/client', () => ({
  createUserApiKey: vi.fn(),
  listSubgraphs: vi.fn(),
}))

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
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
}))

vi.mock('react-icons/hi', () => ({
  HiCheck: () => <span />,
  HiClipboardCopy: () => <span />,
  HiExternalLink: () => <span />,
  HiPuzzle: () => <span />,
  HiSparkles: () => <span />,
}))

vi.mock('@robosystems/core/ui', () => ({
  Tabs: Object.assign(({ children }: any) => <div>{children}</div>, {
    Item: ({ title, children }: any) => (
      <div data-testid={`tab-${title}`}>
        <span>{title}</span>
        {children}
      </div>
    ),
  }),
  Card: ({ children }: any) => <div>{children}</div>,
  Checkbox: ({ id, checked, onChange }: any) => (
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
  ),
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
const mockCreateConnector = vi.mocked(createMcpConnectorUrl)
const mockCreateKey = vi.mocked(createUserApiKey)
const mockListSubgraphs = vi.mocked(listSubgraphs)

const API = 'https://api.robosystems.ai'
const ACME = { graphId: 'kg1a2b3c', graphName: 'Acme Ledger' }
const SEC = { graphId: 'sec', graphName: 'SEC', isRepository: true }

const show = (graphs: any[], currentGraphId: string | null = null) => {
  mockUseGraphContext.mockReturnValue({
    state: { graphs, currentGraphId, isLoading: false, error: null },
  } as any)
  return render(<ConnectContent />)
}

const cards = () =>
  screen.getAllByRole('radio').map((card) => card.getAttribute('data-testid'))
const selected = () =>
  screen
    .getAllByRole('radio')
    .find((card) => card.getAttribute('aria-checked') === 'true')
    ?.getAttribute('data-testid')
const choose = (way: string) =>
  fireEvent.click(screen.getByTestId(`way-${way}`))
const panel = (way: string) => screen.getByTestId(`${way}-panel`)
const tab = (way: string, title: string) =>
  panel(way).querySelector(`[data-testid="tab-${title}"] pre`)?.textContent ??
  ''
const reach = (id: string, value: string) =>
  fireEvent.change(document.getElementById(id)!, { target: { value } })

describe('ConnectContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParams = new URLSearchParams()
    mockListSubgraphs.mockResolvedValue({ data: { subgraphs: [] } } as any)
  })

  describe('the ways in', () => {
    test('a graph with no listing offers sign-in and a key, opening on sign-in', () => {
      show([ACME], ACME.graphId)
      expect(cards()).toEqual(['way-signin', 'way-key'])
      expect(selected()).toBe('way-signin')
    })

    test('the SEC repository adds the directory and opens on it', () => {
      show([ACME, SEC], 'sec')
      expect(cards()).toEqual(['way-directory', 'way-signin', 'way-key'])
      expect(selected()).toBe('way-directory')
      const links = Array.from(panel('directory').querySelectorAll('a')).map(
        (a) => a.textContent
      )
      expect(links).toEqual(['Open in Claude', 'Open in ChatGPT'])
    })

    test('a directory choice does not outlive the graph that had the listing', () => {
      const view = show([ACME, SEC], 'sec')
      choose('directory')
      mockUseGraphContext.mockReturnValue({
        state: {
          graphs: [ACME, SEC],
          currentGraphId: ACME.graphId,
          isLoading: false,
          error: null,
        },
      } as any)
      view.rerender(<ConnectContent />)
      expect(cards()).toEqual(['way-signin', 'way-key'])
      expect(selected()).toBe('way-signin')
    })

    test('with no graphs it says what to do first', () => {
      show([])
      expect(screen.getByTestId('no-graphs')).toBeInTheDocument()
    })
  })

  describe('sign in', () => {
    test('defaults to the address where the graph is picked at sign-in', () => {
      show([ACME], ACME.graphId)
      expect(tab('signin', 'Claude')).toBe(`${API}/v1/mcp`)
      expect(tab('signin', 'Claude Code')).toBe(
        `claude mcp add --transport http robosystems ${API}/v1/mcp`
      )
    })

    test('pinning to the graph puts its id in the address and the name', () => {
      show([ACME], ACME.graphId)
      reach('signin-reach', ACME.graphId)
      expect(tab('signin', 'ChatGPT')).toBe(`${API}/v1/graphs/kg1a2b3c/mcp`)
      expect(tab('signin', 'Cursor')).toBe(
        `"robosystems-kg1a2b3c": { "url": "${API}/v1/graphs/kg1a2b3c/mcp" }`
      )
    })

    test('a subgraph is its own target', async () => {
      mockListSubgraphs.mockResolvedValue({
        data: {
          subgraphs: [{ graph_id: 'kg1a2b3c_dev', display_name: 'dev' }],
        },
      } as any)
      show([ACME], ACME.graphId)
      await waitFor(() =>
        expect(screen.getAllByText('Only Acme Ledger / dev').length).toBe(1)
      )
      reach('signin-reach', 'kg1a2b3c_dev')
      expect(tab('signin', 'VS Code')).toContain('/v1/graphs/kg1a2b3c_dev/mcp')
    })

    test('the RoboLedger address is offered only with a RoboLedger graph', () => {
      const view = show([ACME], ACME.graphId)
      expect(panel('signin').textContent).not.toContain('RoboLedger')
      view.unmount()

      show([{ ...ACME, schemaExtensions: ['roboledger'] }], ACME.graphId)
      reach('signin-reach', 'roboledger')
      expect(tab('signin', 'Claude')).toBe(`${API}/v1/mcp/roboledger`)
    })

    test('a deep link from the Subgraphs page opens pinned to that subgraph', () => {
      searchParams = new URLSearchParams('workspace=kg1a2b3c_dev')
      show([ACME, SEC], ACME.graphId)
      expect(selected()).toBe('way-signin')
      expect(tab('signin', 'Claude')).toBe(`${API}/v1/graphs/kg1a2b3c_dev/mcp`)
    })

    test('a deep link into another graph pins nothing', () => {
      searchParams = new URLSearchParams('workspace=kg9z9z9z_dev')
      show([ACME], ACME.graphId)
      expect(tab('signin', 'Claude')).toBe(`${API}/v1/mcp`)
    })

    test('no sign-in snippet carries a key', () => {
      show([ACME], ACME.graphId)
      expect(panel('signin').textContent).not.toContain('X-API-Key')
    })
  })

  describe('an API key', () => {
    test('defaults to every graph, with a placeholder until a key is made', () => {
      show([ACME], ACME.graphId)
      choose('key')
      expect(tab('key', 'Claude Code')).toBe(
        `claude mcp add --transport http robosystems-graphs \\\n  ${API}/v1/mcp/graphs \\\n  --header "X-API-Key: <your key>"`
      )
      expect(screen.queryByTestId('key-notice')).not.toBeInTheDocument()
    })

    test('read-only is a setting on the every-graph address', () => {
      show([ACME], ACME.graphId)
      choose('key')
      fireEvent.click(document.getElementById('key-read-only')!)
      expect(tab('key', 'Other')).toBe(`${API}/v1/mcp/graphs?read_only=true`)
      expect(tab('key', 'Claude Desktop')).toContain(
        '"ROBOSYSTEMS_READ_ONLY": "true"'
      )
    })

    test('every graph takes an account-wide key', async () => {
      mockCreateKey.mockResolvedValue({ data: { key: 'rfs_all' } } as any)
      show([ACME], ACME.graphId)
      choose('key')
      fireEvent.click(screen.getByText('Generate key'))
      await waitFor(() =>
        expect(screen.getByTestId('key-notice')).toBeInTheDocument()
      )
      expect(mockCreateKey).toHaveBeenCalledWith({
        body: { name: 'MCP - all graphs' },
      })
      expect(mockCreateConnector).not.toHaveBeenCalled()
      expect(tab('key', 'Cursor')).toContain('"X-API-Key": "rfs_all"')
    })

    test('one graph takes its own address and a key scoped to it', async () => {
      mockCreateConnector.mockResolvedValue({
        apiKey: 'rfsc_acme',
        graphId: ACME.graphId,
      } as any)
      show([ACME], ACME.graphId)
      choose('key')
      reach('key-reach', ACME.graphId)
      expect(document.getElementById('key-read-only')).toBeNull()
      fireEvent.click(screen.getByText('Generate key'))
      await waitFor(() =>
        expect(screen.getByTestId('key-notice')).toBeInTheDocument()
      )
      expect(mockCreateConnector).toHaveBeenCalledWith(
        ACME.graphId,
        expect.objectContaining({ name: 'MCP - Acme Ledger' })
      )
      expect(mockCreateKey).not.toHaveBeenCalled()
      expect(tab('key', 'Claude Code')).toBe(
        `claude mcp add --transport http robosystems-kg1a2b3c \\\n  ${API}/v1/graphs/kg1a2b3c/mcp \\\n  --header "X-API-Key: rfsc_acme"`
      )
      expect(tab('key', 'Claude Desktop')).toContain(
        '"ROBOSYSTEMS_GRAPH_ID": "kg1a2b3c"'
      )
    })

    test('a key made for one reach is never shown for another', async () => {
      mockCreateKey.mockResolvedValue({ data: { key: 'rfs_all' } } as any)
      show([ACME], ACME.graphId)
      choose('key')
      fireEvent.click(screen.getByText('Generate key'))
      await waitFor(() =>
        expect(screen.getByTestId('key-notice')).toBeInTheDocument()
      )
      reach('key-reach', ACME.graphId)
      expect(panel('key').textContent).not.toContain('rfs_all')
      expect(screen.getByText('Generate key')).toBeInTheDocument()
    })

    test('a failed key says so and leaves the placeholder', async () => {
      mockCreateKey.mockResolvedValue({ error: {} } as any)
      show([ACME], ACME.graphId)
      choose('key')
      fireEvent.click(screen.getByText('Generate key'))
      await waitFor(() =>
        expect(panel('key').textContent).toContain('Could not create a key')
      )
      expect(tab('key', 'Other')).toBe(`${API}/v1/mcp/graphs`)
    })

    test('Claude Desktop runs the bridge, since it cannot send a header', () => {
      show([ACME], ACME.graphId)
      choose('key')
      const entry = tab('key', 'Claude Desktop')
      expect(entry).toContain('"command": "npx"')
      expect(entry).toContain('@robosystems/mcp@latest')
      expect(entry).not.toContain('ROBOSYSTEMS_GRAPH_ID')
    })

    test('no key ever goes in an address', async () => {
      mockCreateKey.mockResolvedValue({ data: { key: 'rfs_all' } } as any)
      show([ACME], ACME.graphId)
      choose('key')
      fireEvent.click(screen.getByText('Generate key'))
      await waitFor(() =>
        expect(screen.getByTestId('key-notice')).toBeInTheDocument()
      )
      expect(tab('key', 'Other')).not.toContain('rfs_all')
    })
  })
})
