'use client'

import type { SearchHit } from '@robosystems/client'
import { recallMemory } from '@robosystems/client'
import { Badge, Button, Card, Spinner, TextInput } from 'flowbite-react'
import { useState } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'

const RECALL_K = 10

interface RecallPanelProps {
  graphId: string
  onSelectHit: (memoryId: string) => void
}

/**
 * Semantic recall over the graph's memory store. Ranked search — renders
 * scored hits (the governance list below stays the exact-read surface).
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

      <div className="flex gap-2">
        <TextInput
          icon={HiSearch}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRecall()
          }}
          placeholder="What do you want to recall?"
          className="flex-1"
        />
        <Button
          color="purple"
          onClick={handleRecall}
          disabled={searching || !query.trim()}
        >
          {searching ? <Spinner size="sm" /> : 'Recall'}
        </Button>
        {(hits !== null || notice) && (
          <Button color="gray" onClick={handleClear}>
            <HiX className="h-4 w-4" />
          </Button>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recalled {total} memor{total === 1 ? 'y' : 'ies'} for &quot;
              {searchedQuery}&quot; (showing {hits.length})
            </p>
            {hits.map((hit) => (
              <button
                key={hit.document_id}
                type="button"
                onClick={() => onSelectHit(hit.document_id)}
                className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-zinc-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="info" size="xs">
                    {hit.score.toFixed(2)}
                  </Badge>
                  {hit.tags?.map((tag) => (
                    <Badge key={tag} color="purple" size="xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {hit.snippet}
                </p>
              </button>
            ))}
          </div>
        ))}
    </Card>
  )
}
