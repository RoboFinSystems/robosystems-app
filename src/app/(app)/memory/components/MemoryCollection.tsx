'use client'

import type { MemoryRecord, SearchHit } from '@robosystems/client'
import { getMemory, listMemories, recallMemory } from '@robosystems/client'
import { EmptyState, SearchBar } from '@robosystems/core'
import { Button, Card, Select, Spinner } from 'flowbite-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  HiChevronDown,
  HiChevronUp,
  HiExclamation,
  HiLightBulb,
  HiRefresh,
} from 'react-icons/hi'

import { MemoryCard } from './MemoryCard'
import { SOURCE_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from './memory-badges'

const PAGE_SIZE = 50
const RECALL_K = 10

interface MemoryCollectionProps {
  graphId: string
  /** Bump to refetch the collection after a create/edit/forget. */
  refreshKey: number
  /** Reports the loaded page + total so the page can show a count and
   *  derive editor suggestions. Must be stable (useCallback). */
  onLoaded: (memories: MemoryRecord[], total: number) => void
  onEdit: (memory: MemoryRecord) => void
  onDelete: (memory: MemoryRecord) => void
}

/**
 * The unified memory surface: one search bar over one collection. It shows
 * all memories by default and narrows to a ranked subset when you recall;
 * "Show all" resets. Type/Source filters apply to the browse list live and
 * to recall on its next run. Both modes render the same MemoryCard (recall
 * adds a score), so search results and the full list read as one thing.
 */
export function MemoryCollection({
  graphId,
  refreshKey,
  onLoaded,
  onEdit,
  onDelete,
}: MemoryCollectionProps) {
  // Browse-all list
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [listTotal, setListTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  // Filters (shared by browse + recall)
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  // Search (recall)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [hitMemories, setHitMemories] = useState<Record<string, MemoryRecord>>(
    {}
  )
  const [searchedQuery, setSearchedQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const searchMode = hits !== null
  const hasActiveFilters = Boolean(typeFilter || sourceFilter)

  // This component is remounted per graph, so an in-flight list read belongs to
  // the graph that is going away. Its own setState calls are discarded on
  // unmount, but `onLoaded` writes to the parent, which survives — without this
  // guard the previous graph's memories would seed the new graph's editor
  // suggestions and header count.
  const activeRef = useRef(true)
  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
    }
  }, [])

  // --- Browse-all fetch ---

  const fetchAll = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await listMemories({
        path: { graph_id: graphId },
        query: {
          limit: PAGE_SIZE,
          offset,
          memory_type: typeFilter || undefined,
          source: sourceFilter || undefined,
        },
      })
      if (!activeRef.current) return
      if (res.data) {
        const loaded = res.data.memories || []
        setMemories(loaded)
        setListTotal(res.data.total || 0)
        onLoaded(loaded, res.data.total || 0)
        setUnavailable(false)
      } else {
        const status = res.response?.status
        if (status === 403 || status === 404 || status === 503) {
          setUnavailable(true)
        } else {
          throw new Error('Failed to load memories')
        }
      }
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : 'Failed to load memories'
      )
    } finally {
      setListLoading(false)
    }
  }, [graphId, offset, typeFilter, sourceFilter, onLoaded])

  useEffect(() => {
    fetchAll()
  }, [fetchAll, refreshKey])

  const memoriesById = useMemo(() => {
    const map = new Map<string, MemoryRecord>()
    memories.forEach((m) => map.set(m.id, m))
    return map
  }, [memories])

  // --- Recall ---

  const handleRecall = async () => {
    const trimmed = query.trim()
    if (!trimmed || searching) return

    setSearching(true)
    setNotice(null)
    setExpandedId(null)
    try {
      const body: {
        query: string
        k: number
        memory_type?: string
        source?: string
      } = { query: trimmed, k: RECALL_K }
      if (typeFilter) body.memory_type = typeFilter
      if (sourceFilter) body.source = sourceFilter

      const res = await recallMemory({ path: { graph_id: graphId }, body })
      if (res.data) {
        const nextHits = res.data.hits
        // Resolve each hit to its full record — from the loaded page when
        // possible, else fetch the stragglers so every card has full data.
        const missing = nextHits
          .map((h) => h.document_id)
          .filter((id) => !memoriesById.has(id))
        const fetched: Record<string, MemoryRecord> = {}
        await Promise.all(
          missing.map(async (id) => {
            try {
              const r = await getMemory({
                path: { graph_id: graphId, memory_id: id },
              })
              if (r.data) fetched[id] = r.data
            } catch {
              // Skip a hit we can't resolve.
            }
          })
        )
        setHitMemories(fetched)
        setHits(nextHits)
        setSearchedQuery(trimmed)
      } else {
        const status = res.response?.status
        setHits(null)
        setNotice(
          status === 403 || status === 404 || status === 503
            ? 'Semantic memory is not enabled for this graph.'
            : 'Recall failed. Please try again.'
        )
      }
    } catch {
      setHits(null)
      setNotice('An error occurred while recalling memories.')
    } finally {
      setSearching(false)
    }
  }

  const showAll = () => {
    setQuery('')
    setHits(null)
    setHitMemories({})
    setSearchedQuery('')
    setNotice(null)
    setExpandedId(null)
  }

  const changeFilter = (setter: (v: string) => void, value: string) => {
    setter(value)
    setOffset(0)
    setExpandedId(null)
  }

  const toggleExpand = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id))

  const resolveHit = (hit: SearchHit): MemoryRecord | null =>
    memoriesById.get(hit.document_id) ?? hitMemories[hit.document_id] ?? null

  // --- Render helpers ---

  const searchBar = (
    <div className="space-y-4">
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleRecall}
        loading={searching}
        placeholder="Search your memories..."
        buttonLabel="Recall"
        onClear={showAll}
        showClear={searchMode || notice !== null}
      />

      <button
        type="button"
        onClick={() => setShowFilters((s) => !s)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Filters
        {hasActiveFilters && (
          <span
            className="bg-primary-500 h-1.5 w-1.5 rounded-full"
            aria-label="filters active"
          />
        )}
        {showFilters ? (
          <HiChevronUp className="h-4 w-4" />
        ) : (
          <HiChevronDown className="h-4 w-4" />
        )}
      </button>

      {showFilters && (
        <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2 dark:border-gray-700">
          <div>
            <label
              htmlFor="memory-type-filter"
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Type
            </label>
            <Select
              id="memory-type-filter"
              sizing="sm"
              value={typeFilter}
              onChange={(e) => changeFilter(setTypeFilter, e.target.value)}
            >
              <option value="">All types</option>
              {TYPE_FILTER_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label
              htmlFor="memory-source-filter"
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Source
            </label>
            <Select
              id="memory-source-filter"
              sizing="sm"
              value={sourceFilter}
              onChange={(e) => changeFilter(setSourceFilter, e.target.value)}
            >
              <option value="">All sources</option>
              {SOURCE_FILTER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  )

  // --- Collection body ---

  let body: React.ReactNode

  if (unavailable) {
    body = (
      <EmptyState
        icon={HiLightBulb}
        title="Semantic memory is not enabled"
        description="Semantic memory is not enabled in this environment."
      />
    )
  } else if (listError) {
    body = (
      <div className="py-8 text-center">
        <HiExclamation className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {listError}
        </p>
        <Button onClick={fetchAll} className="mt-4">
          <HiRefresh className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  } else if (searchMode) {
    const resolved = hits
      .map((hit) => ({ hit, memory: resolveHit(hit) }))
      .filter((r): r is { hit: SearchHit; memory: MemoryRecord } =>
        Boolean(r.memory)
      )
    body =
      resolved.length === 0 ? (
        <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
          No memories found for &quot;{searchedQuery}&quot;.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {`${resolved.length} ${
                resolved.length === 1 ? 'result' : 'results'
              } for "${searchedQuery}"`}
            </p>
            <Button size="xs" color="gray" onClick={showAll}>
              Show all
            </Button>
          </div>
          {resolved.map(({ hit, memory }) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              score={hit.score}
              expanded={expandedId === memory.id}
              onToggle={() => toggleExpand(memory.id)}
              onEdit={() => onEdit(memory)}
              onDelete={() => onDelete(memory)}
            />
          ))}
        </div>
      )
  } else if (listLoading && memories.length === 0) {
    body = (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    )
  } else if (memories.length === 0) {
    body = (
      <EmptyState
        icon={HiLightBulb}
        title={hasActiveFilters ? 'No matching memories' : 'No memories yet'}
        description={
          hasActiveFilters
            ? 'No memories match the current filters.'
            : 'Store durable facts, notes, and preferences about this graph — or let AI agents remember them via MCP.'
        }
      />
    )
  } else {
    body = (
      <div className="space-y-3">
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            expanded={expandedId === memory.id}
            onToggle={() => toggleExpand(memory.id)}
            onEdit={() => onEdit(memory)}
            onDelete={() => onDelete(memory)}
          />
        ))}

        {listTotal > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, listTotal)} of{' '}
              {listTotal}
            </span>
            <div className="flex gap-2">
              <Button
                size="xs"
                color="gray"
                disabled={offset === 0}
                onClick={() => {
                  setOffset(Math.max(0, offset - PAGE_SIZE))
                  setExpandedId(null)
                }}
              >
                Previous
              </Button>
              <Button
                size="xs"
                color="gray"
                disabled={offset + PAGE_SIZE >= listTotal}
                onClick={() => {
                  setOffset(offset + PAGE_SIZE)
                  setExpandedId(null)
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      {searchBar}
      {notice && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{notice}</p>
      )}
      {body}
    </Card>
  )
}
