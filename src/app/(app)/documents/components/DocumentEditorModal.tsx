'use client'

import { EditorModal } from '@/components/editor/EditorModal'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import type { DocumentDetailResponse } from '@robosystems/client'
import { CategoryInput, TagInput } from '@robosystems/core'
import { Label, TextInput } from 'flowbite-react'
import { useRef, useState } from 'react'

export interface DocumentFormValues {
  title: string
  content: string
  tags: string[]
  folder: string
}

interface DocumentEditorModalProps {
  show: boolean
  /** Existing document when editing; undefined when creating. */
  initial?: DocumentDetailResponse
  saving: boolean
  folderSuggestions?: string[]
  tagSuggestions?: string[]
  onSubmit: (values: DocumentFormValues) => void
  onClose: () => void
}

function DocumentEditorForm({
  show,
  initial,
  saving,
  folderSuggestions,
  tagSuggestions,
  onSubmit,
  onClose,
}: DocumentEditorModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [folder, setFolder] = useState(initial?.folder ?? '')
  const titleRef = useRef<HTMLInputElement | null>(null)

  const canSave =
    !saving && title.trim().length > 0 && content.trim().length > 0

  const dirty =
    title !== (initial?.title ?? '') ||
    content !== (initial?.content ?? '') ||
    folder !== (initial?.folder ?? '') ||
    tags.join('\n') !== (initial?.tags ?? []).join('\n')

  return (
    <EditorModal
      show={show}
      title={initial ? 'Edit Document' : 'New Document'}
      size="7xl"
      onClose={onClose}
      onSave={() =>
        onSubmit({
          title: title.trim(),
          content,
          tags,
          folder: folder.trim(),
        })
      }
      saving={saving}
      canSave={canSave}
      dirty={dirty}
      initialFocus={titleRef}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="document-title">Title</Label>
          <TextInput
            id="document-title"
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title..."
            className="mt-1"
          />
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <div>
            <Label htmlFor="document-folder">Folder</Label>
            <CategoryInput
              id="document-folder"
              value={folder}
              onChange={setFolder}
              suggestions={folderSuggestions}
              placeholder="optional"
              className="mt-1 w-40"
              aria-label="Document folder"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="document-tags">Tags</Label>
            <div className="mt-1">
              <TagInput
                id="document-tags"
                tags={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
                badgeColor="info"
                aria-label="Document tags"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="document-content">Content</Label>
          <div className="mt-1">
            <MarkdownEditor
              id="document-content"
              value={content}
              onChange={setContent}
              heightClassName="h-[62vh]"
            />
          </div>
        </div>
      </div>
    </EditorModal>
  )
}

/**
 * Create/edit modal for a knowledge-base document. Keyed on the document
 * id so reopening the modal (or switching documents) never shows stale
 * form state.
 */
export function DocumentEditorModal(props: DocumentEditorModalProps) {
  if (!props.show) return null
  return <DocumentEditorForm key={props.initial?.id ?? 'new'} {...props} />
}
