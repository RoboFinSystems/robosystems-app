'use client'

import type { MemoryRecord } from '@robosystems/client'
import {
  Badge,
  Button,
  Label,
  Spinner,
  Textarea,
  TextInput,
} from 'flowbite-react'
import { useState } from 'react'
import { HiSave, HiX } from 'react-icons/hi'

// Mirrors the API's RememberOp text limit.
const MAX_TEXT_LENGTH = 10_000

// memory_type is freeform in the API; these are just convenient presets.
const TYPE_PRESETS = ['note', 'fact', 'preference']

export interface MemoryFormValues {
  text: string
  memoryType: string
  tags: string[]
  sourceRef: string
}

interface MemoryFormProps {
  initial?: MemoryRecord
  saving: boolean
  submitLabel: string
  onSubmit: (values: MemoryFormValues) => void
  onCancel: () => void
}

export function MemoryForm({
  initial,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: MemoryFormProps) {
  const [text, setText] = useState(initial?.text ?? '')
  const [memoryType, setMemoryType] = useState(initial?.memory_type ?? 'note')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [sourceRef, setSourceRef] = useState(initial?.source_ref ?? '')

  const canSubmit =
    !saving && text.trim().length > 0 && text.length <= MAX_TEXT_LENGTH

  const handleAddTag = () => {
    const val = tagInput.trim().toLowerCase()
    if (val && !tags.includes(val)) {
      setTags([...tags, val])
    }
    setTagInput('')
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="memory-text">Memory</Label>
          <span
            className={`text-xs ${
              text.length > MAX_TEXT_LENGTH ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="memory-text"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should be remembered about this graph?"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="memory-type">Type</Label>
        <div className="mt-1 flex items-center gap-2">
          <TextInput
            id="memory-type"
            sizing="sm"
            value={memoryType}
            onChange={(e) => setMemoryType(e.target.value)}
            placeholder="note"
            className="w-40"
          />
          {TYPE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMemoryType(preset)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                memoryType === preset
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="memory-tags">Tags</Label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag} color="purple" size="sm">
              <span className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  <HiX className="h-3 w-3" />
                </button>
              </span>
            </Badge>
          ))}
          <TextInput
            id="memory-tags"
            sizing="sm"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tag, press Enter"
            className="w-44"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="memory-source-ref">Source reference</Label>
        <TextInput
          id="memory-source-ref"
          sizing="sm"
          value={sourceRef}
          onChange={(e) => setSourceRef(e.target.value)}
          placeholder="Optional URI or external reference"
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            onSubmit({
              text: text.trim(),
              memoryType: memoryType.trim(),
              tags,
              sourceRef: sourceRef.trim(),
            })
          }
          disabled={!canSubmit}
        >
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2 text-white" />
              Saving...
            </>
          ) : (
            <>
              <HiSave className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
        <Button color="gray" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
