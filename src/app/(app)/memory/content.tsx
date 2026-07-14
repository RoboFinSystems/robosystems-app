'use client'

import type { MemoryRecord } from '@robosystems/client'
import {
  forget,
  getMemory,
  listMemories,
  remember,
  updateMemory,
} from '@robosystems/client'
import {
  ConfirmModal,
  EmptyState,
  LoadingState,
  MarkdownProse,
  PageHeader,
  PageLayout,
  useGraphContext,
  useIsRepository,
} from '@robosystems/core'
import { useToast } from '@robosystems/core/hooks/use-toast'
import {
  Badge,
  Button,
  Card,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiArrowLeft,
  HiExclamation,
  HiLightBulb,
  HiPencil,
  HiPlus,
  HiRefresh,
  HiTrash,
} from 'react-icons/hi'

import { formatDate, SourceBadge, TypeBadge } from './components/memory-badges'
import type { MemoryFormValues } from './components/MemoryEditorModal'
import { MemoryEditorModal } from './components/MemoryEditorModal'
import { RecallPanel } from './components/RecallPanel'

const PAGE_SIZE = 50

type View = { mode: 'list' } | { mode: 'detail'; memory: MemoryRecord }

/** Create/edit happens in a modal over whichever view is active. */
type EditorState = { open: boolean; memory?: MemoryRecord }

type FeatureState = 'unknown' | 'available' | 'unavailable'

export function MemoryPageContent() {
  const { state: graphState } = useGraphContext()
  const selectedGraphId = graphState.currentGraphId
  const { isRepository } = useIsRepository()
  const { showSuccess, showError, ToastContainer } = useToast()

  // Memory list state
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featureState, setFeatureState] = useState<FeatureState>('unknown')

  // List controls
  const [offset, setOffset] = useState(0)

  // View state machine
  const [view, setView] = useState<View>({ mode: 'list' })
  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [saving, setSaving] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<MemoryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // --- Data Fetching ---

  const fetchMemories = useCallback(
    async (showSpinner = false) => {
      if (!selectedGraphId || isRepository) {
        setLoading(false)
        return
      }

      try {
        if (showSpinner) setLoading(true)
        setError(null)

        const response = await listMemories({
          path: { graph_id: selectedGraphId },
          query: {
            limit: PAGE_SIZE,
            offset,
          },
        })

        if (response.data) {
          setMemories(response.data.memories || [])
          setTotal(response.data.total || 0)
          setFeatureState('available')
        } else {
          // Feature-gated endpoints 404 when memory is off and 403 on shared
          // repositories — degrade softly instead of surfacing a hard error.
          const status = response.response?.status
          if (status === 403 || status === 404 || status === 503) {
            setFeatureState('unavailable')
          } else {
            throw new Error('Failed to fetch memories')
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load memories'
        setError(msg)
        showError(msg, 8000)
      } finally {
        setLoading(false)
      }
    },
    [selectedGraphId, isRepository, offset, showError]
  )

  useEffect(() => {
    fetchMemories(true)
  }, [fetchMemories])

  // --- Handlers ---

  const openDetailById = async (memoryId: string) => {
    if (!selectedGraphId) return

    try {
      const response = await getMemory({
        path: { graph_id: selectedGraphId, memory_id: memoryId },
      })
      if (!response.data) {
        throw new Error('Failed to load memory')
      }
      setView({ mode: 'detail', memory: response.data })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load memory'
      showError(msg, 5000)
    }
  }

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
        fetchMemories()
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

        // Refresh the detail view if it is showing the edited record.
        if (view.mode === 'detail' && view.memory.id === memory.id) {
          const refreshed = await getMemory({
            path: { graph_id: selectedGraphId, memory_id: memory.id },
          })
          setView(
            refreshed.data
              ? { mode: 'detail', memory: refreshed.data }
              : { mode: 'list' }
          )
        }
        fetchMemories()
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

        if (view.mode === 'detail' && view.memory.id === deleteTarget.id) {
          setView({ mode: 'list' })
        }
        setDeleteTarget(null)
        fetchMemories()
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

  // --- Editor helpers ---

  const handleEditorSubmit = (values: MemoryFormValues) => {
    if (editor.memory) {
      handleUpdate(editor.memory, values)
    } else {
      handleCreate(values)
    }
  }

  // Suggestions come from the already-loaded page of memories.
  const tagSuggestions = useMemo(
    () => Array.from(new Set(memories.flatMap((m) => m.tags ?? []))),
    [memories]
  )
  const typeSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          memories
            .map((m) => m.memory_type)
            .filter((t): t is string => Boolean(t))
        )
      ),
    [memories]
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

  // --- Loading State ---

  if (loading) {
    return (
      <PageLayout>
        <LoadingState message="Loading memories..." />
      </PageLayout>
    )
  }

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

  // --- Feature Not Enabled ---

  if (featureState === 'unavailable') {
    return (
      <PageLayout>
        <Card>
          <EmptyState
            icon={HiLightBulb}
            title="Semantic memory is not enabled"
            description="Semantic memory is not enabled in this environment."
          />
        </Card>
      </PageLayout>
    )
  }

  // --- Error State ---

  if (error) {
    return (
      <PageLayout>
        <Card>
          <div className="py-12 text-center">
            <HiExclamation className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Error loading memories
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
            <Button onClick={() => fetchMemories(true)} className="mt-4">
              <HiRefresh className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
        <ToastContainer />
      </PageLayout>
    )
  }

  // --- Detail View ---

  if (view.mode === 'detail') {
    const memory = view.memory

    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              color="gray"
              onClick={() => setView({ mode: 'list' })}
            >
              <HiArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memory
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="gray"
              onClick={() => setEditor({ open: true, memory })}
            >
              <HiPencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              color="gray"
              onClick={() => setDeleteTarget(memory)}
            >
              <HiTrash className="mr-1 h-4 w-4 text-red-500" />
              Forget
            </Button>
          </div>
        </div>

        <Card>
          <MarkdownProse size="sm">{memory.text}</MarkdownProse>
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <div className="mt-1">
                <TypeBadge memoryType={memory.memory_type} />
              </div>
            </div>
            <div>
              <Label>Source</Label>
              <div className="mt-1">
                <SourceBadge source={memory.source} />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {memory.tags?.length ? (
                  memory.tags.map((tag) => (
                    <Badge key={tag} color="purple" size="sm">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">none</span>
                )}
              </div>
            </div>
            <div>
              <Label>Source reference</Label>
              <p className="mt-1 break-all text-gray-500 dark:text-gray-400">
                {memory.source_ref || '—'}
              </p>
            </div>
            <div>
              <Label>Created</Label>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {formatDate(memory.created_at)}
                {memory.created_by ? ` by ${memory.created_by}` : ''}
              </p>
            </div>
            <div>
              <Label>Updated</Label>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {formatDate(memory.updated_at)}
              </p>
            </div>
          </div>
          {memory.provenance && (
            <div>
              <Label>Provenance</Label>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-zinc-800 dark:text-gray-300">
                {JSON.stringify(memory.provenance, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        <ConfirmModal
          show={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Forget Memory"
          confirmLabel="Forget"
          confirmIcon={HiTrash}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This memory will be permanently removed. This action cannot be
            undone.
          </p>
        </ConfirmModal>

        {editorModal}
        <ToastContainer />
      </PageLayout>
    )
  }

  // --- List View ---

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

      <RecallPanel graphId={selectedGraphId} onSelectHit={openDetailById} />

      {/* Memory List */}
      {memories.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiLightBulb}
            title="No memories yet"
            description="Store durable facts, notes, and preferences about this graph — or let AI agents remember them via MCP."
          />
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Memory</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Source</TableHeadCell>
              <TableHeadCell>Tags</TableHeadCell>
              <TableHeadCell>Updated</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">Actions</span>
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {memories.map((memory) => (
                <TableRow
                  key={memory.id}
                  className="cursor-pointer bg-white dark:border-gray-700 dark:bg-zinc-800"
                  onClick={() => setView({ mode: 'detail', memory })}
                >
                  <TableCell className="max-w-md font-medium text-gray-900 dark:text-white">
                    <span className="line-clamp-1">{memory.text}</span>
                  </TableCell>
                  <TableCell>
                    <TypeBadge memoryType={memory.memory_type} />
                  </TableCell>
                  <TableCell>
                    <SourceBadge source={memory.source} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {memory.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} color="purple" size="xs">
                          {tag}
                        </Badge>
                      ))}
                      {memory.tags && memory.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{memory.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {formatDate(memory.updated_at)}
                  </TableCell>
                  <TableCell>
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
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => setEditor({ open: true, memory })}
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Forget">
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => setDeleteTarget(memory)}
                        >
                          <HiTrash className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{' '}
            {total}
          </span>
          <div className="flex gap-2">
            <Button
              size="xs"
              color="gray"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              size="xs"
              color="gray"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

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
