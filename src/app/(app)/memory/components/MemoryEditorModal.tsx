'use client'

import { EditorModal } from '@/components/editor/EditorModal'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import type { MemoryRecord } from '@robosystems/client'
import { CategoryInput, TagInput } from '@robosystems/core'
import { Label, TextInput } from 'flowbite-react'
import { useState } from 'react'

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

interface MemoryEditorModalProps {
  show: boolean
  /** Existing record when editing; undefined when creating. */
  initial?: MemoryRecord
  saving: boolean
  /** Observed memory_type values — merged with the presets. */
  typeSuggestions?: string[]
  tagSuggestions?: string[]
  onSubmit: (values: MemoryFormValues) => void
  onClose: () => void
}

interface FormProps extends Omit<MemoryEditorModalProps, 'show'> {
  show: boolean
}

function MemoryEditorForm({
  show,
  initial,
  saving,
  typeSuggestions,
  tagSuggestions,
  onSubmit,
  onClose,
}: FormProps) {
  const [text, setText] = useState(initial?.text ?? '')
  const [memoryType, setMemoryType] = useState(initial?.memory_type ?? 'note')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [sourceRef, setSourceRef] = useState(initial?.source_ref ?? '')

  const canSave =
    !saving && text.trim().length > 0 && text.length <= MAX_TEXT_LENGTH

  const dirty =
    text !== (initial?.text ?? '') ||
    memoryType !== (initial?.memory_type ?? 'note') ||
    sourceRef !== (initial?.source_ref ?? '') ||
    tags.join('\n') !== (initial?.tags ?? []).join('\n')

  const allTypeSuggestions = Array.from(
    new Set([...TYPE_PRESETS, ...(typeSuggestions ?? [])])
  )

  return (
    <EditorModal
      show={show}
      title={initial ? 'Edit Memory' : 'New Memory'}
      size="3xl"
      onClose={onClose}
      onSave={() =>
        onSubmit({
          text: text.trim(),
          memoryType: memoryType.trim(),
          tags,
          sourceRef: sourceRef.trim(),
        })
      }
      saving={saving}
      canSave={canSave}
      saveLabel={initial ? 'Save' : 'Remember'}
      dirty={dirty}
    >
      {/* Metadata above content — same layout convention as the document
          editor modal. */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="memory-type">Type</Label>
            <CategoryInput
              id="memory-type"
              value={memoryType}
              onChange={setMemoryType}
              suggestions={allTypeSuggestions}
              placeholder="note"
              className="mt-1 w-40"
              aria-label="Memory type"
            />
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
        </div>

        <div>
          <Label htmlFor="memory-tags">Tags</Label>
          <div className="mt-1">
            <TagInput
              id="memory-tags"
              tags={tags}
              onChange={setTags}
              suggestions={tagSuggestions}
              badgeColor="purple"
              aria-label="Memory tags"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="memory-text">Memory</Label>
          <div className="mt-1">
            <MarkdownEditor
              id="memory-text"
              value={text}
              onChange={setText}
              heightClassName="h-72"
              maxLength={MAX_TEXT_LENGTH}
              previewSize="sm"
              lineNumbers="off"
              focusOnMount
            />
          </div>
        </div>
      </div>
    </EditorModal>
  )
}

/**
 * Create/edit modal for a memory. Keyed on the record id so reopening the
 * modal (or switching records) never shows stale form state.
 */
export function MemoryEditorModal(props: MemoryEditorModalProps) {
  if (!props.show) return null
  return <MemoryEditorForm key={props.initial?.id ?? 'new'} {...props} />
}
