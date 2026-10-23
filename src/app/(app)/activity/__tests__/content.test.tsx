import { sdkError, sdkOk } from '@/test-utils/sdk'
import {
  getOperatorRun,
  listGraphMembers,
  listGraphMutations,
} from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mutable so a test can switch the graph under a request in flight.
const graph = vi.hoisted(() => ({ currentGraphId: 'kg1' }))

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useGraphContext: () => ({
      state: { currentGraphId: graph.currentGraphId },
    }),
  }
})

import ActivityContent from '../content'

const mutations = vi.mocked(listGraphMutations)
const members = vi.mocked(listGraphMembers)
const runDetail = vi.mocked(getOperatorRun)

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

const SHOW_RUN = 'Show every change from this run'

const RUN = {
  operation_id: 'op_run_1',
  thread_id: 'thr_1',
  user_id: 'user_1',
  operator_type: 'author',
  mode: 'standard',
  status: 'completed',
  question: 'Remember that July closed late.',
  answer: 'Noted: July closed late.',
  error: null,
  credits_consumed: 12.5,
  call_count: 3,
  tools_called: ['remember'],
  write_count: 1,
  started_at: '2026-09-28T09:59:56Z',
  finished_at: '2026-09-28T10:00:00Z',
  duration_ms: 4200,
  history: [],
  transcript: [],
  result: {},
}

describe('ActivityContent', () => {
  beforeEach(() => {
    graph.currentGraphId = 'kg1'
    mutations.mockReset()
    members.mockReset()
    runDetail.mockReset()
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

  it('drops a next page that lands after the graph was switched', async () => {
    let releaseOldPage: (value: unknown) => void = () => {}
    mutations
      .mockResolvedValueOnce(
        sdkOk({ graph_id: 'kg1', entries: [ENTRIES[0]], next_cursor: 'c1' })
      )
      .mockImplementationOnce(
        () => new Promise((resolve) => (releaseOldPage = resolve))
      )
      .mockResolvedValueOnce(
        sdkOk({ graph_id: 'kg2', entries: [], next_cursor: null })
      )
    const { rerender } = render(<ActivityContent />)

    fireEvent.click(await screen.findByText('Load more'))

    graph.currentGraphId = 'kg2'
    rerender(<ActivityContent />)
    await waitFor(() => expect(mutations).toHaveBeenCalledTimes(3))
    releaseOldPage(
      sdkOk({ graph_id: 'kg1', entries: [ENTRIES[1]], next_cursor: null })
    )

    await waitFor(() =>
      expect(screen.queryByText('Load more')).not.toBeInTheDocument()
    )
    expect(screen.queryByText('create-agent')).not.toBeInTheDocument()
    expect(screen.queryByText('remember')).not.toBeInTheDocument()
  })

  it("shows the selected run's question and answer above its changes", async () => {
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries: ENTRIES, next_cursor: null })
    )
    runDetail.mockResolvedValue(sdkOk(RUN))
    render(<ActivityContent />)

    fireEvent.click(await screen.findByText('author run'))

    expect(
      await screen.findByText('Remember that July closed late.')
    ).toBeInTheDocument()
    expect(screen.getByText('Noted: July closed late.')).toBeInTheDocument()
    expect(
      screen.getByText(/4\.2s · 12\.5 credits · 3 model calls/)
    ).toBeInTheDocument()
    expect(runDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { graph_id: 'kg1', operation_id: 'op_run_1' },
      })
    )
  })

  it('lists the changes without a card when the run has no record', async () => {
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries: ENTRIES, next_cursor: null })
    )
    runDetail.mockResolvedValue(sdkError(404, 'Run not found'))
    render(<ActivityContent />)

    fireEvent.click(await screen.findByText('author run'))

    await waitFor(() => expect(runDetail).toHaveBeenCalled())
    expect(screen.getByText('Showing one AI run · clear')).toBeInTheDocument()
    expect(screen.queryByText('Asked')).not.toBeInTheDocument()
  })

  it("drops the previous run's card while the next record loads", async () => {
    const entries = [
      ENTRIES[0],
      { ...ENTRIES[0], id: 'oma_5', operation_id: 'op_run_2' },
    ]
    mutations.mockResolvedValue(
      sdkOk({ graph_id: 'kg1', entries, next_cursor: null })
    )
    runDetail
      .mockResolvedValueOnce(sdkOk(RUN))
      .mockImplementationOnce(() => new Promise(() => {}))
    render(<ActivityContent />)

    fireEvent.click((await screen.findAllByTitle(SHOW_RUN))[0])
    await screen.findByText('Remember that July closed late.')

    fireEvent.click(screen.getAllByTitle(SHOW_RUN)[1])

    await waitFor(() => expect(runDetail).toHaveBeenCalledTimes(2))
    expect(
      screen.queryByText('Remember that July closed late.')
    ).not.toBeInTheDocument()
  })
})
