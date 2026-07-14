'use client'

import type { MemoryRecord, SearchHit } from '@robosystems/client'
import { getMemory, recallMemory } from '@robosystems/client'
import {
  MarkdownProse,
  SearchBar,
  SearchHitCard,
  SearchResultsMeta,
} from '@robosystems/core'
import { Button, Card, Select, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { HiArrowRight, HiChevronDown, HiChevronUp } from 'react-icons/hi'

import {
  formatDate,
  SOURCE_FILTER_OPTIONS,
  SourceBadge,
  TYPE_FILTER_OPTIONS,
  TypeBadge,
} from './memory-badges'

const RECALL_K = 10

interface RecallPanelProps {
  graphId: string
  onSelectHit: (memoryId: string) => void
}

/**
 * Semantic recall over the graph's memory store, aligned to the document
 * Search page: shared search bar, collapsible Type/Source filters (the
 * recall API accepts memory_type + source), and hits that expand in place
 * to show the full memory — mirroring Search's expand-on-click. Recall
 * stays a top-k semantic probe (no pagination, always semantic), and each
 * hit keeps a path to the governance detail via "Open memory". The list
 * below the panel remains the exact-read / management surface.
 */
export function RecallPanel({ graphId, onSelectHit }: RecallPanelProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [total, setTotal] = useState(0)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Recall-scoped filters (mirrors the Search page's collapsible filters).
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  // Inline expansion — mirrors Search's expand-in-place (one at a time).
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedMemory, setExpandedMemory] = useState<MemoryRecord | null>(
    null
  )
  const [expandLoading, setExpandLoading] = useState(false)

  const handleRecall = async () => {
    const trimmed = query.trim()
    if (!trimmed || searching) return

    setSearching(true)
    setNotice(null)
    setExpandedId(null)
    setExpandedMemory(null)

    try {
      const body: {
        query: string
        k: number
        memory_type?: string
        source?: string
      } = { query: trimmed, k: RECALL_K }
      if (typeFilter) body.memory_type = typeFilter
      if (sourceFilter) body.source = sourceFilter

      const response = await recallMemory({
        path: { graph_id: graphId },
        body,
      })

      if (response.data) {
        setHits(response.data.hits)
        setTotal(response.data.total)
        setSearchedQuery(trimmed)
      } else {
        const status = response.response?.status
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

  const handleClear = () => {
    setQuery('')
    setHits(null)
    setTotal(0)
    setSearchedQuery('')
    setNotice(null)
    setExpandedId(null)
    setExpandedMemory(null)
  }

  const handleExpand = async (memoryId: string) => {
    if (expandedId === memoryId) {
      setExpandedId(null)
      setExpandedMemory(null)
      return
    }

    setExpandedId(memoryId)
    setExpandedMemory(null)
    setExpandLoading(true)
    try {
      const response = await getMemory({
        path: { graph_id: graphId, memory_id: memoryId },
      })
      setExpandedMemory(response.data ?? null)
    } catch {
      setExpandedMemory(null)
    } finally {
      setExpandLoading(false)
    }
  }

  const hasActiveFilters = Boolean(typeFilter || sourceFilter)

  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recall
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Semantic search over this graph&apos;s memories
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={handleRecall}
          loading={searching}
          placeholder="What do you want to recall?"
          buttonLabel="Recall"
          onClear={handleClear}
          showClear={hits !== null || notice !== null}
        />

        {/* Filters toggle */}
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
                htmlFor="recall-type"
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Type
              </label>
              <Select
                id="recall-type"
                sizing="sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
                htmlFor="recall-source"
                className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Source
              </label>
              <Select
                id="recall-source"
                sizing="sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
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

      {notice && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{notice}</p>
      )}

      {hits !== null &&
        (hits.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No memories found for &quot;{searchedQuery}&quot;.
          </p>
        ) : (
          <div className="space-y-2">
            <SearchResultsMeta
              total={total}
              count={hits.length}
              query={searchedQuery}
            >
              Recalled {total} memor{total === 1 ? 'y' : 'ies'} for &quot;
              {searchedQuery}&quot; (showing {hits.length})
            </SearchResultsMeta>
            {hits.map((hit) => (
              <SearchHitCard
                key={hit.document_id}
                hit={hit}
                showTitle={false}
                showSourceType={false}
                expanded={expandedId === hit.document_id}
                onClick={() => handleExpand(hit.document_id)}
              >
                {expandLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Spinner size="sm" />
                    Loading memory...
                  </div>
                ) : expandedMemory ? (
                  <div className="space-y-3">
                    <MarkdownProse size="sm">
                      {expandedMemory.text}
                    </MarkdownProse>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <TypeBadge memoryType={expandedMemory.memory_type} />
                      <SourceBadge source={expandedMemory.source} />
                      <span>
                        Updated {formatDate(expandedMemory.updated_at)}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => onSelectHit(hit.document_id)}
                      >
                        Open memory
                        <HiArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Could not load this memory.
                  </p>
                )}
              </SearchHitCard>
            ))}
          </div>
        ))}
    </Card>
  )
}
