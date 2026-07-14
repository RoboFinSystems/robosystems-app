'use client'

import type { SearchHit } from '@robosystems/client'
import { recallMemory } from '@robosystems/client'
import { SearchBar, SearchHitCard, SearchResultsMeta } from '@robosystems/core'
import { Card } from 'flowbite-react'
import { useState } from 'react'

const RECALL_K = 10

interface RecallPanelProps {
  graphId: string
  onSelectHit: (memoryId: string) => void
}

/**
 * Semantic recall over the graph's memory store, rendered through the same
 * search primitives as the document Search page. Ranked search — hits open
 * the memory detail (the governance list below stays the exact-read
 * surface). Deliberately no filters or pagination: recall is a top-k
 * semantic probe, not a browse surface.
 */
export function RecallPanel({ graphId, onSelectHit }: RecallPanelProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [total, setTotal] = useState(0)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleRecall = async () => {
    const trimmed = query.trim()
    if (!trimmed || searching) return

    setSearching(true)
    setNotice(null)

    try {
      const response = await recallMemory({
        path: { graph_id: graphId },
        body: { query: trimmed, k: RECALL_K },
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
  }

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
                onClick={() => onSelectHit(hit.document_id)}
              />
            ))}
          </div>
        ))}
    </Card>
  )
}
