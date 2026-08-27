import {
  listUserOAuthGrants,
  revokeUserOAuthGrant,
  type OAuthGrantInfo,
} from '@robosystems/client'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectedAppsCard } from '../ConnectedAppsCard'

const mockedList = vi.mocked(listUserOAuthGrants)
const mockedRevoke = vi.mocked(revokeUserOAuthGrant)

const TRUSTED: OAuthGrantInfo = {
  id: 'oag_trusted',
  client_name: 'Claude',
  client_uri: 'https://claude.ai',
  client_is_trusted: true,
  graph_id: 'sec',
  graph_name: 'SEC EDGAR Filings',
  resource: 'https://api.example.com/v1/mcp',
  scope: 'mcp',
  created_at: '2026-08-26T00:00:00Z',
  last_used_at: '2026-08-27T00:00:00Z',
}

const UNTRUSTED: OAuthGrantInfo = {
  id: 'oag_untrusted',
  client_name: 'research-test',
  client_uri: null,
  client_is_trusted: false,
  graph_id: 'kg00000000000000000abc',
  graph_name: null,
  resource: 'https://api.example.com/v1/mcp',
  scope: 'mcp',
  created_at: '2026-08-27T00:00:00Z',
  last_used_at: null,
}

function listOk(grants: OAuthGrantInfo[]) {
  mockedList.mockResolvedValue({ data: { grants } } as never)
}

describe('ConnectedAppsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listOk([])
    mockedRevoke.mockResolvedValue({ data: { success: true } } as never)
  })

  it('shows the empty state with no table chrome', async () => {
    render(<ConnectedAppsCard />)
    expect(await screen.findByText('No apps connected')).toBeInTheDocument()
    expect(
      screen.getByText(/Claude, ChatGPT, Cursor, or VS Code/)
    ).toBeInTheDocument()
    expect(screen.queryByTestId('connected-apps-list')).not.toBeInTheDocument()
    expect(screen.queryByTestId('connected-apps-error')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Revoke' })
    ).not.toBeInTheDocument()
  })

  it('shows the error copy, not the empty state, when the list fails', async () => {
    mockedList.mockResolvedValue({ error: { detail: 'nope' } } as never)
    render(<ConnectedAppsCard />)
    expect(
      await screen.findByText(/Couldn't load connected apps/)
    ).toBeInTheDocument()
    expect(screen.queryByText('No apps connected')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('lists trusted and untrusted grants with the badge only on the latter', async () => {
    listOk([TRUSTED, UNTRUSTED])
    render(<ConnectedAppsCard />)
    expect(await screen.findByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('research-test')).toBeInTheDocument()
    expect(screen.getByText(/SEC EDGAR Filings/)).toBeInTheDocument()
    expect(screen.getByText('kg00000000000000000abc')).toBeInTheDocument()
    expect(screen.getByText('Unverified')).toBeInTheDocument()
    expect(screen.getAllByText('Unverified')).toHaveLength(1)
    const claude = screen.getByText('Claude')
    expect(claude.closest('a')).toHaveAttribute('href', 'https://claude.ai')
  })

  it('revoking confirms, posts the grant id, and drops the row', async () => {
    listOk([TRUSTED, UNTRUSTED])
    const onSuccess = vi.fn()
    render(<ConnectedAppsCard onSuccess={onSuccess} />)
    expect(await screen.findByText('research-test')).toBeInTheDocument()
    listOk([TRUSTED])

    fireEvent.click(screen.getByTestId('revoke-oag_untrusted'))
    expect(screen.getByRole('dialog')).toHaveTextContent(
      /Revoke research-test on kg00000000000000000abc/
    )

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Revoke' })
    )
    await waitFor(() =>
      expect(mockedRevoke).toHaveBeenCalledWith({
        path: { grant_id: 'oag_untrusted' },
      })
    )
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith('Connected app revoked')
    )
    expect(screen.queryByText('research-test')).not.toBeInTheDocument()
    expect(screen.getByText('Claude')).toBeInTheDocument()
  })
})
