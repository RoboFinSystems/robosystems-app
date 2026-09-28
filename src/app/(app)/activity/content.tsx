'use client'

import type { MutationAuditEntry } from '@robosystems/client'
import { listGraphMembers, listGraphMutations } from '@robosystems/client'
import {
  EmptyState,
  LoadingState,
  PageHeader,
  PageLayout,
  useGraphContext,
} from '@robosystems/core'
import { isApiError, unwrapSdk } from '@robosystems/core/lib/sdk-errors'
import {
  Badge,
  Button,
  Card,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import { HiClock } from 'react-icons/hi'

type Surface = 'api' | 'mcp' | 'operator'
type Period = '1' | '7' | '30' | 'all'

const PAGE_SIZE = 50

const SURFACE_LABELS: Record<Surface, string> = {
  api: 'API',
  mcp: 'MCP client',
  operator: 'AI operator',
}

const SURFACE_COLORS: Record<Surface, string> = {
  api: 'gray',
  mcp: 'indigo',
  operator: 'purple',
}

function sinceFor(period: Period): string | undefined {
  if (period === 'all') return undefined
  const days = Number(period)
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function shortId(id: string): string {
  return id.length > 14 ? `${id.slice(0, 14)}…` : id
}

function viaLabel(entry: MutationAuditEntry): string {
  if (entry.surface === 'operator') {
    return entry.operator_type ?? 'operator'
  }
  if (entry.api_key_prefix) return `API key ${entry.api_key_prefix}…`
  if (entry.auth_method) return entry.auth_method.replace('_', ' ')
  return '—'
}

export default function ActivityContent() {
  const { state: graphState } = useGraphContext()
  const graphId = graphState.currentGraphId

  const [entries, setEntries] = useState<MutationAuditEntry[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [names, setNames] = useState<Record<string, string>>({})
  const [surface, setSurface] = useState<Surface | 'all'>('all')
  const [period, setPeriod] = useState<Period>('7')
  const [run, setRun] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      if (!graphId) return null
      return unwrapSdk(
        await listGraphMutations({
          path: { graph_id: graphId },
          query: {
            surface: surface === 'all' ? undefined : surface,
            operation_id: run ?? undefined,
            since: sinceFor(period),
            cursor: cursor ?? undefined,
            limit: PAGE_SIZE,
          },
        })
      )
    },
    [graphId, surface, period, run]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setForbidden(false)
    void (async () => {
      try {
        const page = await fetchPage(null)
        if (cancelled || !page) return
        setEntries(page.entries)
        setNextCursor(page.next_cursor ?? null)
      } catch (err) {
        if (cancelled) return
        if (isApiError(err) && err.status === 403) setForbidden(true)
        else setError('Could not load activity.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchPage])

  // Names for the "who" column; the same admin gate as the log itself.
  useEffect(() => {
    if (!graphId) return
    let cancelled = false
    void (async () => {
      try {
        const members = unwrapSdk(
          await listGraphMembers({ path: { graph_id: graphId } })
        )
        if (cancelled) return
        setNames(
          Object.fromEntries(members.members.map((m) => [m.user_id, m.name]))
        )
      } catch {
        // Ids stand in for names.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [graphId])

  const loadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const page = await fetchPage(nextCursor)
      if (page) {
        setEntries((prev) => [...prev, ...page.entries])
        setNextCursor(page.next_cursor ?? null)
      }
    } catch {
      setError('Could not load more activity.')
    } finally {
      setLoadingMore(false)
    }
  }

  const header = (
    <PageHeader
      icon={HiClock}
      title="Activity"
      subtitle="Every change made to this graph through the API, MCP clients, and AI operators."
    />
  )

  if (!graphId) {
    return (
      <PageLayout>
        {header}
        <EmptyState
          icon={HiClock}
          title="No graph selected"
          description="Select a graph to see its activity."
        />
      </PageLayout>
    )
  }

  if (forbidden) {
    return (
      <PageLayout>
        {header}
        <EmptyState
          icon={HiClock}
          title="Graph admins only"
          description="Ask an admin of this graph for access to its activity."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {header}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="activity-source">Source</Label>
            <Select
              id="activity-source"
              value={surface}
              onChange={(e) => setSurface(e.target.value as Surface | 'all')}
            >
              <option value="all">All sources</option>
              <option value="api">API</option>
              <option value="mcp">MCP clients</option>
              <option value="operator">AI operators</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="activity-window">Period</Label>
            <Select
              id="activity-window"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All retained</option>
            </Select>
          </div>
          {run && (
            <Button color="light" size="sm" onClick={() => setRun(null)}>
              Showing one AI run · clear
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Loading activity…" />
      ) : error ? (
        <EmptyState
          icon={HiClock}
          title="Something went wrong"
          description={error}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={HiClock}
          title="No changes"
          description="Nothing changed this graph in the selected period."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Time</TableHeadCell>
                  <TableHeadCell>Source</TableHeadCell>
                  <TableHeadCell>Change</TableHeadCell>
                  <TableHeadCell>Who</TableHeadCell>
                  <TableHeadCell>Via</TableHeadCell>
                  <TableHeadCell>Result</TableHeadCell>
                  <TableHeadCell>Objects</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(entry.occurred_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge color={SURFACE_COLORS[entry.surface]}>
                        {SURFACE_LABELS[entry.surface]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.operation_name}
                    </TableCell>
                    <TableCell>
                      {entry.user_id
                        ? (names[entry.user_id] ?? shortId(entry.user_id))
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {entry.surface === 'operator' && entry.operation_id ? (
                        <button
                          type="button"
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                          onClick={() => setRun(entry.operation_id ?? null)}
                          title="Show every change from this run"
                        >
                          {viaLabel(entry)} run
                        </button>
                      ) : (
                        viaLabel(entry)
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.status === 'completed' ? (
                        <Badge color="success">Completed</Badge>
                      ) : (
                        <Badge
                          color="failure"
                          title={entry.error_code ?? undefined}
                        >
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {(entry.object_ids ?? []).map(shortId).join(', ') || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button color="light" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </PageLayout>
  )
}
