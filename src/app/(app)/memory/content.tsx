'use client'

import type { MemoryRecord } from '@robosystems/client'
import { forget, remember, updateMemory } from '@robosystems/client'
import {
  ConfirmModal,
  EmptyState,
  PageHeader,
  PageLayout,
  useGraphContext,
  useIsRepository,
} from '@robosystems/core'
import { useToast } from '@robosystems/core/hooks/use-toast'
import { Button, Card, Label } from 'flowbite-react'
import { useCallback, useMemo, useState } from 'react'
import { HiExclamation, HiLightBulb, HiPlus, HiTrash } from 'react-icons/hi'

import { MemoryCollection } from './components/MemoryCollection'
import type { MemoryFormValues } from './components/MemoryEditorModal'
import { MemoryEditorModal } from './components/MemoryEditorModal'

/** Create/edit happens in a modal over the collection. */
type EditorState = { open: boolean; memory?: MemoryRecord }

export function MemoryPageContent() {
  const { state: graphState } = useGraphContext()
  const selectedGraphId = graphState.currentGraphId
  const { isRepository } = useIsRepository()
  const { showSuccess, showError, ToastContainer } = useToast()

  // The loaded page + total, reported up by the collection (for the header
  // count and the editor's tag/type suggestions).
  const [loadedMemories, setLoadedMemories] = useState<MemoryRecord[]>([])
  const [total, setTotal] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MemoryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = () => setRefreshKey((k) => k + 1)

  const handleLoaded = useCallback(
    (memories: MemoryRecord[], nextTotal: number) => {
      setLoadedMemories(memories)
      setTotal(nextTotal)
    },
    []
  )

  // --- Mutations ---

  const handleCreate = async (values: MemoryFormValues) => {
    if (!selectedGraphId) return

    try {
      setSaving(true)
      const response = await remember({
        path: { graph_id: selectedGraphId },
        body: {
          text: values.text,
          memory_type: values.memoryType || undefined,
          tags: values.tags.length > 0 ? values.tags : null,
          source_ref: values.sourceRef || null,
        },
      })

      if (response.data && response.data.status !== 'failed') {
        showSuccess('Memory stored', 5000)
        setEditor({ open: false })
        refresh()
      } else {
        throw new Error(
          response.error ? JSON.stringify(response.error) : 'Create failed'
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Create failed'
      showError(msg, 8000)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    memory: MemoryRecord,
    values: MemoryFormValues
  ) => {
    if (!selectedGraphId) return

    try {
      setSaving(true)
      const response = await updateMemory({
        path: { graph_id: selectedGraphId },
        body: {
          memory_id: memory.id,
          text: values.text,
          memory_type: values.memoryType || null,
          tags: values.tags.length > 0 ? values.tags : null,
          source_ref: values.sourceRef || null,
        },
      })

      if (response.data && response.data.status !== 'failed') {
        showSuccess('Memory updated', 5000)
        setEditor({ open: false })
        refresh()
      } else {
        throw new Error(
          response.error ? JSON.stringify(response.error) : 'Update failed'
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      showError(msg, 8000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedGraphId || !deleteTarget) return

    try {
      setDeleting(true)
      const response = await forget({
        path: { graph_id: selectedGraphId },
        body: { memory_id: deleteTarget.id },
      })

      if (response.data && response.data.status !== 'failed') {
        showSuccess('Memory forgotten', 5000)
        setDeleteTarget(null)
        refresh()
      } else {
        throw new Error(
          response.error ? JSON.stringify(response.error) : 'Delete failed'
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      showError(msg, 8000)
    } finally {
      setDeleting(false)
    }
  }

  const handleEditorSubmit = (values: MemoryFormValues) => {
    if (editor.memory) {
      handleUpdate(editor.memory, values)
    } else {
      handleCreate(values)
    }
  }

  // Editor suggestions from the loaded page.
  const tagSuggestions = useMemo(
    () => Array.from(new Set(loadedMemories.flatMap((m) => m.tags ?? []))),
    [loadedMemories]
  )
  const typeSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          loadedMemories
            .map((m) => m.memory_type)
            .filter((t): t is string => Boolean(t))
        )
      ),
    [loadedMemories]
  )

  const editorModal = (
    <MemoryEditorModal
      show={editor.open}
      initial={editor.memory}
      saving={saving}
      typeSuggestions={typeSuggestions}
      tagSuggestions={tagSuggestions}
      onSubmit={handleEditorSubmit}
      onClose={() => setEditor({ open: false })}
    />
  )

  // --- No Graph Selected ---

  if (!selectedGraphId) {
    return (
      <PageLayout>
        <Card>
          <EmptyState
            icon={HiLightBulb}
            title="No graph selected"
            description="Please select a graph to manage its memory."
          />
        </Card>
      </PageLayout>
    )
  }

  // --- Shared Repository ---

  if (isRepository) {
    return (
      <PageLayout>
        <Card>
          <EmptyState
            icon={HiLightBulb}
            title="Not available for shared repositories"
            description="Semantic memory is only available on your own graphs."
          />
        </Card>
      </PageLayout>
    )
  }

  // --- Unified Collection ---

  return (
    <PageLayout>
      <PageHeader
        icon={HiLightBulb}
        title="Memory"
        subtitle={
          <>
            {total} memor{total !== 1 ? 'ies' : 'y'} stored
          </>
        }
        actions={
          <Button onClick={() => setEditor({ open: true })}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Memory
          </Button>
        }
      />

      <MemoryCollection
        graphId={selectedGraphId}
        refreshKey={refreshKey}
        onLoaded={handleLoaded}
        onEdit={(memory) => setEditor({ open: true, memory })}
        onDelete={(memory) => setDeleteTarget(memory)}
      />

      {/* Forget Confirmation Modal */}
      <ConfirmModal
        show={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Forget Memory"
        confirmLabel="Forget"
        confirmIcon={HiTrash}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex gap-2">
              <HiExclamation className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">
                  This action cannot be undone
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  This memory will be permanently removed.
                </p>
              </div>
            </div>
          </div>
          {deleteTarget && (
            <div>
              <Label>Memory</Label>
              <p className="mt-1 line-clamp-3 text-sm font-medium text-gray-900 dark:text-white">
                {deleteTarget.text}
              </p>
            </div>
          )}
        </div>
      </ConfirmModal>

      {editorModal}
      <ToastContainer />
    </PageLayout>
  )
}
