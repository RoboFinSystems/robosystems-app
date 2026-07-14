import { Badge } from 'flowbite-react'

// Freeform in the API; these presets cover the common values.
export const TYPE_FILTER_OPTIONS = ['note', 'fact', 'preference']
export const SOURCE_FILTER_OPTIONS = ['api', 'mcp', 'agent']

const TYPE_BADGE_COLORS: Record<string, string> = {
  note: 'info',
  fact: 'success',
  preference: 'purple',
}

const SOURCE_BADGE_COLORS: Record<string, string> = {
  api: 'gray',
  mcp: 'indigo',
  agent: 'warning',
}

export function TypeBadge({ memoryType }: { memoryType?: string | null }) {
  if (!memoryType) return null
  return (
    <Badge color={TYPE_BADGE_COLORS[memoryType] || 'gray'} size="sm">
      {memoryType}
    </Badge>
  )
}

export function SourceBadge({ source }: { source?: string | null }) {
  if (!source) return null
  return (
    <Badge color={SOURCE_BADGE_COLORS[source] || 'gray'} size="sm">
      {source}
    </Badge>
  )
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}
