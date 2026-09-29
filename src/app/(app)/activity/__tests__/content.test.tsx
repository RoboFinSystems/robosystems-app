import { sdkError, sdkOk } from '@/test-utils/sdk'
import { listGraphMembers, listGraphMutations } from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useGraphContext: () => ({ state: { currentGraphId: 'kg1' } }),
  }
})

import ActivityContent from '../content'

const mutations = vi.mocked(listGraphMutations)
const members = vi.mocked(listGraphMembers)

const ENTRIES = [
  {
    id: 'oma_3',
    occurred_at: '2026-09-28T10:00:00Z',
    surface: 'operator',
    operation_name: 'remember',
    status: 'completed',
    duration_ms: 50,
    user_id: 'user_1',
    operator_type: 'author',
    operation_id: 'op_run_1',
    object_ids: ['mem_1'],
  },
  {
    id: 'oma_2',
    occurred_at: '2026-09-28T09:00:00Z',
    surface: 'mcp',
    operation_name: 'create-agent',
    status: 'failed',
    error_code: 'conflict',
    duration_ms: 40,
    user_id: 'user_1',
    auth_method: 'api_key',
    api_key_prefix: 'rfsab12',
    object_ids: [],
  },
]

describe('ActivityContent', () => {
  beforeEach(() => {
    mutations.mockReset()
    members.mockReset()
    members.mockResolvedValue(
      sdkOk({ members: [{ user_id: 'user_1', name: 'Joey French' }] })
    )
  })

  it('lists changes with their source, caller and result', async () => {
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries: ENTRIES, next_cursor: null })
    )
    render(<ActivityContent />)

    await screen.findByText('remember')
    expect(screen.getByText('AI operator')).toBeInTheDocument()
    expect(screen.getByText('MCP client')).toBeInTheDocument()
    expect(screen.getAllByText('Joey French')).toHaveLength(2)
    expect(screen.getByText('API key rfsab12…')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.queryByText('Load more')).not.toBeInTheDocument()
  })

  it('shows a dispatched async operation as started, not failed', async () => {
    mutations.mockResolvedValue(
      sdkOk({
        graph_id: 'kg1',
        entries: [
          {
            id: 'oma_4',
            occurred_at: '2026-09-28T11:00:00Z',
            surface: 'api',
            operation_name: 'create-backup',
            status: 'pending',
            duration_ms: 12,
            user_id: 'user_1',
            operation_id: 'op_bak_1',
            object_ids: [],
          },
        ],
        next_cursor: null,
      })
    )
    render(<ActivityContent />)

    await screen.findByText('create-backup')
    expect(screen.getByText('Started')).toBeInTheDocument()
    expect(screen.queryByText('Failed')).not.toBeInTheDocument()
  })

  it('tells a non-admin the page is for graph admins', async () => {
    mutations.mockResolvedValue(sdkError(403, 'Admin access required'))
    render(<ActivityContent />)
    expect(await screen.findByText('Graph admins only')).toBeInTheDocument()
  })

  it('filters by source', async () => {
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries: ENTRIES, next_cursor: null })
    )
    render(<ActivityContent />)
    await screen.findByText('remember')

    fireEvent.change(screen.getByLabelText('Source'), {
      target: { value: 'operator' },
    })

    await waitFor(() =>
      expect(mutations).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ surface: 'operator' }),
        })
      )
    )
  })

  it('narrows to one AI run from its row', async () => {
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries: ENTRIES, next_cursor: null })
    )
    render(<ActivityContent />)

    fireEvent.click(await screen.findByText('author run'))

    await waitFor(() =>
      expect(mutations).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ operation_id: 'op_run_1' }),
        })
      )
    )
    expect(screen.getByText('Showing one AI run · clear')).toBeInTheDocument()
  })

  it('loads the next page on the cursor', async () => {
    mutations
      .mockResolvedValueOnce(
        sdkOk({ graph_id: 'kg1', entries: [ENTRIES[0]], next_cursor: 'c1' })
      )
      .mockResolvedValueOnce(
        sdkOk({ graph_id: 'kg1', entries: [ENTRIES[1]], next_cursor: null })
      )
    render(<ActivityContent />)

    fireEvent.click(await screen.findByText('Load more'))

    await screen.findByText('create-agent')
    expect(mutations).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ cursor: 'c1' }),
      })
    )
    expect(screen.queryByText('Load more')).not.toBeInTheDocument()
  })
})
