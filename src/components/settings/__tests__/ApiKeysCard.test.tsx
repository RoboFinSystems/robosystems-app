import {
  createUserApiKey,
  listUserApiKeys,
  revokeUserApiKey,
  type ApiKeyInfo,
} from '@robosystems/client'
import { GraphContext } from '@robosystems/core'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiKeysCard } from '../ApiKeysCard'

const mockedList = vi.mocked(listUserApiKeys)
const mockedRevoke = vi.mocked(revokeUserApiKey)
const mockedCreate = vi.mocked(createUserApiKey)

// Noon UTC keeps the rendered calendar day stable in any test-runner zone.
const SCOPED: ApiKeyInfo = {
  id: 'uak_scoped',
  name: 'Claude connector - SEC',
  prefix: 'rfs_ab12',
  is_active: true,
  created_at: '2026-08-23T12:00:00Z',
  last_used_at: '2026-08-26T12:00:00Z',
  graph_id: 'sec',
}

const ACCOUNT_WIDE: ApiKeyInfo = {
  id: 'uak_wide',
  name: 'CI runner',
  prefix: 'rfs_cd34',
  is_active: true,
  created_at: '2026-06-17T12:00:00Z',
  last_used_at: null,
  graph_id: null,
}

function listOk(api_keys: ApiKeyInfo[]) {
  mockedList.mockResolvedValue({ data: { api_keys } } as never)
}

function withGraphs(children: ReactNode) {
  return (
    <GraphContext.Provider
      value={{
        state: {
          graphs: [
            {
              graphId: 'sec',
              graphName: 'SEC EDGAR Filings',
              isSelected: false,
            },
          ],
          currentGraphId: null,
          isLoading: false,
          error: null,
        },
        loadGraphs: vi.fn(),
        setCurrentGraph: vi.fn(),
        refreshGraphs: vi.fn(),
      }}
    >
      {children}
    </GraphContext.Provider>
  )
}

describe('ApiKeysCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listOk([])
    mockedRevoke.mockResolvedValue({ data: { success: true } } as never)
  })

  it('shows the empty state with a create action and no list chrome', async () => {
    render(<ApiKeysCard connectHref="/connect" />)
    expect(await screen.findByText('No API keys yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Connect page' })).toHaveAttribute(
      'href',
      '/connect'
    )
    expect(
      screen.getByRole('button', { name: 'Create API key' })
    ).toBeInTheDocument()
    expect(screen.queryByTestId('api-keys-list')).not.toBeInTheDocument()
    expect(screen.queryByTestId('api-keys-error')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Revoke' })
    ).not.toBeInTheDocument()
  })

  it('shows the error copy, not the empty state, when the list fails', async () => {
    mockedList.mockResolvedValue({ error: { detail: 'nope' } } as never)
    render(<ApiKeysCard />)
    expect(
      await screen.findByText(/Couldn't load API keys/)
    ).toBeInTheDocument()
    expect(screen.queryByText('No API keys yet')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('lists keys as rows: prefix, scope, dates — and no status column', async () => {
    listOk([SCOPED, ACCOUNT_WIDE])
    render(<ApiKeysCard connectHref="/connect" />)
    expect(
      await screen.findByText('Claude connector - SEC')
    ).toBeInTheDocument()
    expect(screen.getByText('CI runner')).toBeInTheDocument()

    const list = screen.getByTestId('api-keys-list')
    expect(list).toHaveTextContent('rfs_ab12…')
    // Outside a GraphProvider the scope falls back to the raw graph id.
    expect(within(list).getByText('sec')).toBeInTheDocument()
    expect(list).toHaveTextContent('Account-wide')
    expect(list).toHaveTextContent(
      'Created Aug 23, 2026 · Last used Aug 26, 2026'
    )
    expect(list).toHaveTextContent('Created Jun 17, 2026 · Never used')

    // The API returns active keys only, so the old "Active" pill is gone.
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Revoke' })).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: 'Create API key' })
    ).toBeInTheDocument()
  })

  it('resolves a scoped key to its graph name when the graph context has it', async () => {
    listOk([SCOPED])
    render(withGraphs(<ApiKeysCard />))
    expect(
      await screen.findByText('Claude connector - SEC')
    ).toBeInTheDocument()
    expect(screen.getByTestId('api-keys-list')).toHaveTextContent(
      'SEC EDGAR Filings'
    )
    expect(screen.queryByText('sec')).not.toBeInTheDocument()
  })

  it('revoking confirms, posts the key id, and drops the row', async () => {
    listOk([SCOPED, ACCOUNT_WIDE])
    const onSuccess = vi.fn()
    render(<ApiKeysCard onSuccess={onSuccess} />)
    expect(await screen.findByText('CI runner')).toBeInTheDocument()
    listOk([SCOPED])

    fireEvent.click(screen.getByTestId('revoke-uak_wide'))
    expect(screen.getByRole('dialog')).toHaveTextContent(/Revoke CI runner\?/)

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Revoke' })
    )
    await waitFor(() =>
      expect(mockedRevoke).toHaveBeenCalledWith({
        path: { api_key_id: 'uak_wide' },
      })
    )
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith('API key revoked')
    )
    expect(screen.queryByText('CI runner')).not.toBeInTheDocument()
    expect(screen.getByText('Claude connector - SEC')).toBeInTheDocument()
  })

  it('keeps the row and reports an error when revoke fails', async () => {
    listOk([ACCOUNT_WIDE])
    mockedRevoke.mockResolvedValue({ error: { detail: 'nope' } } as never)
    const onError = vi.fn()
    render(<ApiKeysCard onError={onError} />)
    expect(await screen.findByText('CI runner')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('revoke-uak_wide'))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Revoke' })
    )
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(
        'Could not revoke this key. Try again.'
      )
    )
    // The dialog stays open for a retry, so scope to the list.
    expect(
      within(screen.getByTestId('api-keys-list')).getByText('CI runner')
    ).toBeInTheDocument()
  })

  it('creates a key through the dialog without a filler description and adds the row', async () => {
    mockedCreate.mockResolvedValue({
      data: { api_key: ACCOUNT_WIDE, key: 'rfs_cd34_full_secret_value' },
    } as never)
    render(<ApiKeysCard />)
    expect(await screen.findByText('No API keys yet')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create API key' }))
    // The card refetches after a create; hand the mock the new key.
    listOk([ACCOUNT_WIDE])
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/API Key Name/), {
      target: { value: 'CI runner' },
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Create API Key' })
    )

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith({
        body: { name: 'CI runner', graph_id: undefined },
      })
    )
    expect(await screen.findByTestId('api-keys-list')).toHaveTextContent(
      'CI runner'
    )
    expect(screen.queryByText('No API keys yet')).not.toBeInTheDocument()
  })
})
