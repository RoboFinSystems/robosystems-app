'use client'

import type { MemoryRecord } from '@robosystems/client'
import { MarkdownProse } from '@robosystems/core'
import { Badge, Button, Card, Tooltip } from 'flowbite-react'
import { HiChevronDown, HiChevronUp, HiPencil, HiTrash } from 'react-icons/hi'

import { formatDate, SourceBadge, TypeBadge } from './memory-badges'

interface MemoryCardProps {
  memory: MemoryRecord
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  /** Semantic-recall score — shown only in search results. */
  score?: number
}

const MAX_VISIBLE_TAGS = 4

/**
 * One memory rendered as an expandable card — the shared list item for both
 * the browse-all view and semantic-recall results (recall adds a score
 * badge). Collapsed shows a preview + badges; expanded shows the full text
 * via MarkdownProse plus metadata. Edit/Forget stay inline.
 */
export function MemoryCard({
  memory,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  score,
}: MemoryCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer text-left"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-2">
            {score !== undefined && (
              <Badge color="info" size="xs">
                {score.toFixed(2)}
              </Badge>
            )}
            <TypeBadge memoryType={memory.memory_type} />
            <SourceBadge source={memory.source} />
            {memory.tags?.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <Badge key={tag} color="purple" size="xs">
                {tag}
              </Badge>
            ))}
            {memory.tags && memory.tags.length > MAX_VISIBLE_TAGS && (
              <span className="text-xs text-gray-400">
                +{memory.tags.length - MAX_VISIBLE_TAGS}
              </span>
            )}
          </div>
          {!expanded && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
              {memory.text}
            </p>
          )}
        </button>

        <div className="flex flex-shrink-0 items-center gap-1">
          <div
            role="toolbar"
            aria-label="Memory actions"
            className="flex gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
              }
            }}
          >
            <Tooltip content="Edit">
              <Button size="xs" color="gray" onClick={onEdit}>
                <HiPencil className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip content="Forget">
              <Button size="xs" color="gray" onClick={onDelete}>
                <HiTrash className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {expanded ? (
              <HiChevronUp className="h-5 w-5" />
            ) : (
              <HiChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <MarkdownProse size="sm">{memory.text}</MarkdownProse>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {memory.source_ref && <span>Ref: {memory.source_ref}</span>}
            <span>Updated {formatDate(memory.updated_at)}</span>
            {memory.created_by && <span>By {memory.created_by}</span>}
          </div>
        </div>
      )}
    </Card>
  )
}
