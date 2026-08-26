import { useGraphContext } from '@robosystems/core'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ConsentContent } from '../content'

vi.mock('@robosystems/core', () => ({
  useGraphContext: vi.fn(),
  getValidToken: vi.fn(async () => 'session-token'),
}))

const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

vi.mock('react-icons/hi', () => ({
  HiExclamation: () => <span>Icon</span>,
  HiLockClosed: () => <span>Icon</span>,
  HiShieldCheck: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={rest['data-testid']}
    >
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Radio: ({ id, checked, onChange, value }: any) => (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
    />
  ),
  Spinner: ({ 'aria-label': label }: any) => <div role="status">{label}</div>,
}))

const REQUEST_ID = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_ab'
const PENDING = {
  request_id: REQUEST_ID,
  client_name: 'Visual Studio Code',
  client_uri: 'https://code.visualstudio.com',
  logo_uri: null,
  is_trusted: false,
  redirect_host: '127.0.0.1',
  is_loopback_redirect: true,
  resource: 'http://localhost:8000/v1/mcp',
  graph_id: null,
  scope: 'mcp',
}
const GRAPHS = [
  { graphId: 'sec', graphName: 'SEC Repository', isRepository: true },
  { graphId: 'kg1a2b3c', graphName: 'Acme Ledger', isRepository: false },
  { graphId: 'kg9z8y7x', graphName: 'Beta Books', isRepository: false },
]

const mockUseGraphContext = vi.mocked(useGraphContext)
const fetchMock = vi.fn()

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

const setGraphs = (
  graphs: any[],
  currentGraphId: string | null = null,
  isLoading = false
) => {
  mockUseGraphContext.mockReturnValue({
    state: { graphs, currentGraphId, isLoading, error: null },
  } as any)
}

describe('ConsentContent', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.set('request_id', REQUEST_ID)
    global.fetch = fetchMock as any
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })
    setGraphs(GRAPHS, 'kg1a2b3c')
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  test('renders the client, the loopback warning, and the picker', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, PENDING))
    render(<ConsentContent />)

    expect(await screen.findByText('Visual Studio Code')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent("isn't verified")
    expect(
      screen.getByText(/an app running on this computer/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('(127.0.0.1)', { exact: false })
    ).toBeInTheDocument()

    // Own graphs and repositories both listed; the current graph preselected.
    expect(screen.getByTestId('graph-picker')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText(/Acme Ledger/)).toBeChecked()
    )
    expect(screen.getByLabelText(/SEC Repository/)).not.toBeChecked()

    // The pending request was fetched with the session bearer.
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(new RegExp(`/v1/oauth/authorize/${REQUEST_ID}$`))
    expect(init.headers.Authorization).toBe('Bearer session-token')
  })

  test('approving posts the chosen graph and navigates to the callback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, PENDING))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          redirect_to: 'http://127.0.0.1:33418/?code=abc&state=s',
        })
      )
    render(<ConsentContent />)
    await screen.findByText('Visual Studio Code')

    fireEvent.click(screen.getByLabelText(/SEC Repository/))
    expect(screen.getByLabelText(/SEC Repository/)).toBeChecked()

    fireEvent.click(screen.getByTestId('approve'))

    await waitFor(() =>
      expect(window.location.href).toBe(
        'http://127.0.0.1:33418/?code=abc&state=s'
      )
    )
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toMatch(/\/decision$/)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ approved: true, graph_id: 'sec' })
  })

  test('cancelling posts a denial and follows the error callback', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, PENDING))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          redirect_to: 'http://127.0.0.1:33418/?error=access_denied',
        })
      )
    render(<ConsentContent />)
    await screen.findByText('Visual Studio Code')

    fireEvent.click(screen.getByTestId('deny'))

    await waitFor(() =>
      expect(window.location.href).toBe(
        'http://127.0.0.1:33418/?error=access_denied'
      )
    )
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      approved: false,
      graph_id: null,
    })
  })

  test('a per-graph request shows the fixed graph and no picker', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, {
          ...PENDING,
          is_trusted: true,
          is_loopback_redirect: false,
          redirect_host: 'claude.ai',
          resource: 'http://localhost:8000/v1/graphs/kg9z8y7x/mcp',
          graph_id: 'kg9z8y7x',
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { redirect_to: 'https://claude.ai/cb?code=1' })
      )
    render(<ConsentContent />)
    await screen.findByText('Visual Studio Code')

    expect(screen.queryByTestId('graph-picker')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByTestId('fixed-graph')).toHaveTextContent('Beta Books')
    expect(screen.getByText('claude.ai')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('approve'))
    await waitFor(() =>
      expect(window.location.href).toBe('https://claude.ai/cb?code=1')
    )
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      approved: true,
      graph_id: 'kg9z8y7x',
    })
  })

  test('an expired request explains itself', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { detail: 'gone' }))
    render(<ConsentContent />)
    expect(await screen.findByTestId('consent-failure')).toHaveTextContent(
      /expired or was already answered/
    )
  })

  test('a malformed request id never reaches the API', async () => {
    mockSearchParams.set('request_id', '../etc')
    render(<ConsentContent />)
    expect(await screen.findByTestId('consent-failure')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('with no graphs the approve button is disabled', async () => {
    setGraphs([], null)
    fetchMock.mockResolvedValueOnce(jsonResponse(200, PENDING))
    render(<ConsentContent />)
    await screen.findByText('Visual Studio Code')
    expect(screen.getByTestId('no-graphs')).toBeInTheDocument()
    expect(screen.getByTestId('approve')).toBeDisabled()
  })
})
