'use client'

import type {
  DocumentDetailResponse,
  DocumentListItem,
} from '@robosystems/client'
import {
  deleteDocument,
  getDocument,
  indexDocument,
  listDocuments,
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
import { Badge, Button, Card, Label, Spinner, Tooltip } from 'flowbite-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  HiArrowLeft,
  HiDocumentAdd,
  HiDocumentText,
  HiExclamation,
  HiPencil,
  HiPlus,
  HiRefresh,
  HiTrash,
} from 'react-icons/hi'

import type { DocumentFormValues } from './components/DocumentEditorModal'
import { DocumentEditorModal } from './components/DocumentEditorModal'

// --- Source Type Badge ---

function SourceBadge({ sourceType }: { sourceType: string }) {
  const colors: Record<string, string> = {
    uploaded_doc: 'info',
    memory: 'purple',
    xbrl_textblock: 'success',
    narrative_section: 'success',
    ixbrl_disclosure: 'success',
    connection_doc: 'warning',
  }
  const labels: Record<string, string> = {
    uploaded_doc: 'Uploaded',
    memory: 'Memory',
    xbrl_textblock: 'XBRL',
    narrative_section: 'Narrative',
    ixbrl_disclosure: 'iXBRL',
    connection_doc: 'Connection',
  }
  return (
    <Badge color={colors[sourceType] || 'gray'} size="sm">
      {labels[sourceType] || sourceType}
    </Badge>
  )
}

/** Create/edit happens in a modal over whichever view is active. */
type EditorState = { open: boolean; doc?: DocumentDetailResponse }

// --- Main Component ---

export function DocumentsPageContent() {
  const { state: graphState } = useGraphContext()
  const selectedGraphId = graphState.currentGraphId
  const { isRepository } = useIsRepository()
  const { showSuccess, showError, ToastContainer } = useToast()

  // Document list state
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail (viewer) state
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetailResponse | null>(
    null
  )
  const [detailLoading, setDetailLoading] = useState(false)

  // Editor modal state
  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [saving, setSaving] = useState(false)

  // Delete confirm state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentListItem | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // --- Computed ---

  const isInDetailView = selectedDoc !== null || detailLoading
  const canEdit = !isRepository && selectedDoc?.source_type === 'uploaded_doc'

  // Suggestions come from the already-loaded document list.
  const folderSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          documents.map((d) => d.folder).filter((f): f is string => Boolean(f))
        )
      ),
    [documents]
  )
  const tagSuggestions = useMemo(
    () => Array.from(new Set(documents.flatMap((d) => d.tags ?? []))),
    [documents]
  )

  // --- Data Fetching ---

  // The graph a request was issued for, readable from inside an in-flight call
  // so a response that arrives after a graph switch can be dropped.
  const loadedGraphIdRef = useRef(selectedGraphId)
  useEffect(() => {
    loadedGraphIdRef.current = selectedGraphId
  }, [selectedGraphId])

  // Documents are per-graph rows, so every id here belongs to the graph it was
  // read from. Carrying a selection across a switch pointed the viewer, the
  // editor and the delete confirm at ids the new graph does not contain — the
  // API scopes each id to its graph, so those requests fail rather than touch
  // the wrong record, but the user saw another graph's document and got an
  // unexplained error on save or delete.
  useEffect(() => {
    setSelectedDoc(null)
    setDetailLoading(false)
    setEditor({ open: false })
    setShowDeleteModal(false)
    setDeleteTarget(null)
    setDocuments([])
    setTotalDocuments(0)
    setError(null)
  }, [selectedGraphId])

  const fetchDocuments = useCallback(
    async (showSpinner = false) => {
      if (!selectedGraphId) {
        setLoading(false)
        return
      }

      try {
        if (showSpinner) setLoading(true)
        setError(null)

        const response = await listDocuments({
          path: { graph_id: selectedGraphId },
        })

        if (loadedGraphIdRef.current !== selectedGraphId) return

        if (!response.data) {
          throw new Error('Failed to fetch documents')
        }

        setDocuments(response.data.documents || [])
        setTotalDocuments(response.data.total || 0)
      } catch (err) {
        if (loadedGraphIdRef.current !== selectedGraphId) return
        const msg =
          err instanceof Error ? err.message : 'Failed to load documents'
        setError(msg)
        showError(msg, 8000)
      } finally {
        if (loadedGraphIdRef.current === selectedGraphId) setLoading(false)
      }
    },
    [selectedGraphId, showError]
  )

  useEffect(() => {
    fetchDocuments(true)
  }, [fetchDocuments])

  // --- Navigation ---

  const goBackToList = () => {
    setSelectedDoc(null)
  }

  const fetchDocumentDetail = async (
    documentId: string
  ): Promise<DocumentDetailResponse | null> => {
    if (!selectedGraphId) return null
    try {
      const response = await getDocument({
        path: { graph_id: selectedGraphId, document_id: documentId },
      })
      // The read was issued against a graph that is no longer selected; its
      // result must not open a viewer or seed the editor under the new one.
      if (loadedGraphIdRef.current !== selectedGraphId) return null
      if (!response.data) {
        throw new Error('Failed to load document')
      }
      return response.data
    } catch (err) {
      if (loadedGraphIdRef.current !== selectedGraphId) return null
      const msg = err instanceof Error ? err.message : 'Failed to load document'
      showError(msg, 5000)
      return null
    }
  }

  const handleSelectDocument = async (doc: DocumentListItem) => {
    setDetailLoading(true)
    const detail = await fetchDocumentDetail(doc.id)
    if (detail) {
      setSelectedDoc(detail)
    }
    setDetailLoading(false)
  }

  // --- Editor entry points ---

  const handleNewDocument = () => {
    setEditor({ open: true })
  }

  const handleEditFromList = async (doc: DocumentListItem) => {
    const detail = await fetchDocumentDetail(doc.id)
    if (detail) {
      setEditor({ open: true, doc: detail })
    }
  }

  // --- Save Handler (create or update) ---

  const handleSave = async (values: DocumentFormValues) => {
    if (!selectedGraphId) return
    const editingDoc = editor.doc

    try {
      setSaving(true)

      const response = await indexDocument({
        path: { graph_id: selectedGraphId },
        body: {
          ...(editingDoc ? { document_id: editingDoc.id } : {}),
          title: values.title,
          content: values.content,
          tags: values.tags.length > 0 ? values.tags : null,
          folder: values.folder || null,
        },
      })

      if (!response.data) {
        throw new Error(
          response.error ? JSON.stringify(response.error) : 'Save failed'
        )
      }

      const result = (response.data as any).result
      showSuccess(
        `${editingDoc ? 'Saved' : 'Created'} "${values.title}" (${result.sections_indexed} sections)`,
        5000
      )
      setEditor({ open: false })

      // Show the created document, or refresh the open detail view.
      if (!editingDoc) {
        const created = await fetchDocumentDetail(result.id)
        if (created) setSelectedDoc(created)
      } else if (selectedDoc?.id === editingDoc.id) {
        const refreshed = await fetchDocumentDetail(editingDoc.id)
        if (refreshed) setSelectedDoc(refreshed)
      }

      fetchDocuments()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      showError(msg, 8000)
    } finally {
      setSaving(false)
    }
  }

  // --- Delete Handler ---

  const handleDelete = async () => {
    if (!selectedGraphId || !deleteTarget) return

    try {
      setDeleting(true)

      const response = await deleteDocument({
        path: { graph_id: selectedGraphId },
        body: { document_id: deleteTarget.id },
      })

      if (response.data) {
        showSuccess(`Deleted "${deleteTarget.document_title}"`, 5000)
        setShowDeleteModal(false)
        setDeleteTarget(null)

        if (selectedDoc?.id === deleteTarget.id) {
          setSelectedDoc(null)
        }

        fetchDocuments()
      } else if (response.error) {
        throw new Error(JSON.stringify(response.error))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      showError(msg, 8000)
    } finally {
      setDeleting(false)
    }
  }

  // --- Editor Modal (rendered in both list and detail views) ---

  const editorModal = (
    <DocumentEditorModal
      show={editor.open}
      initial={editor.doc}
      saving={saving}
      folderSuggestions={folderSuggestions}
      tagSuggestions={tagSuggestions}
      onSubmit={handleSave}
      onClose={() => setEditor({ open: false })}
    />
  )

  // --- Loading State ---

  if (loading) {
    return (
      <PageLayout>
        <LoadingState message="Loading documents..." />
      </PageLayout>
    )
  }

  // --- No Graph Selected ---

  if (!selectedGraphId) {
    return (
      <PageLayout>
        <Card>
          <EmptyState
            icon={HiDocumentText}
            title="No graph selected"
            description="Please select a graph to manage your knowledge base."
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
              Error loading documents
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
            <Button onClick={() => fetchDocuments(true)} className="mt-4">
              <HiRefresh className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      </PageLayout>
    )
  }

  // --- Document Detail (Viewer) View ---

  if (isInDetailView) {
    return (
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-7xl flex-col gap-4 overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              size="sm"
              color="gray"
              onClick={goBackToList}
              className="flex-shrink-0"
            >
              <HiArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <h1 className="min-w-0 flex-1 text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDoc?.title || ''}
            </h1>
          </div>
          {canEdit && selectedDoc && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setEditor({ open: true, doc: selectedDoc })}
              >
                <HiPencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                color="gray"
                onClick={() => {
                  const listItem = documents.find(
                    (d) => d.id === selectedDoc.id
                  )
                  if (listItem) {
                    setDeleteTarget(listItem)
                    setShowDeleteModal(true)
                  }
                }}
              >
                <HiTrash className="mr-1 h-4 w-4 text-red-500" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Properties Bar */}
        {selectedDoc && (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-zinc-800/50">
            {/* Row 1: Folder */}
            <div className="flex items-center gap-4">
              <span className="w-12 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                Folder
              </span>
              {selectedDoc.folder ? (
                <Badge color="gray" size="sm">
                  {selectedDoc.folder}
                </Badge>
              ) : (
                <span className="text-xs text-gray-400">none</span>
              )}
              <div className="flex-1" />
              <SourceBadge sourceType={selectedDoc.source_type} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedDoc.sections_indexed} section
                {selectedDoc.sections_indexed !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Row 2: Tags */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="w-12 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                Tags
              </span>
              {selectedDoc.tags && selectedDoc.tags.length > 0 ? (
                selectedDoc.tags.map((tag) => (
                  <Badge
                    key={tag}
                    color="gray"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">none</span>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <Card className="min-h-0 flex-1">
          {detailLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : selectedDoc ? (
            <div className="h-full overflow-y-auto">
              <MarkdownProse className="px-6 py-4">
                {selectedDoc.content}
              </MarkdownProse>
            </div>
          ) : null}
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Document"
          confirmLabel="Delete"
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
                    This document will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
            {deleteTarget && (
              <div>
                <Label>Document</Label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {deleteTarget.document_title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {deleteTarget.section_count} section
                  {deleteTarget.section_count !== 1 ? 's' : ''} will be deleted
                </p>
              </div>
            )}
          </div>
        </ConfirmModal>

        {editorModal}
        <ToastContainer />
      </div>
    )
  }

  // --- Document List View ---

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
        icon={HiDocumentText}
        title="Knowledge Base"
        subtitle={
          <>
            {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} indexed
          </>
        }
        actions={
          !isRepository && (
            <Button onClick={handleNewDocument}>
              <HiPlus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          )
        }
      />

      {/* Document List */}
      {documents.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiDocumentAdd}
            title="Knowledge base is empty"
            description={
              isRepository
                ? 'No documents have been indexed yet.'
                : 'Upload policies, procedures, or reference documents to build your knowledge base.'
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700"
              onClick={() => handleSelectDocument(doc)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiDocumentText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {doc.document_title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <SourceBadge sourceType={doc.source_type} />
                      {doc.folder && (
                        <Badge color="gray" size="sm">
                          {doc.folder}
                        </Badge>
                      )}
                      {doc.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} color="gray" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags && doc.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {doc.section_count} section
                    {doc.section_count !== 1 ? 's' : ''}
                  </span>
                  {!isRepository && doc.source_type === 'uploaded_doc' && (
                    <div
                      role="toolbar"
                      aria-label="Document actions"
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
                          onClick={() => handleEditFromList(doc)}
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => {
                            setDeleteTarget(doc)
                            setShowDeleteModal(true)
                          }}
                        >
                          <HiTrash className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Document"
        confirmLabel="Delete"
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
                  This document will be permanently removed.
                </p>
              </div>
            </div>
          </div>
          {deleteTarget && (
            <div>
              <Label>Document</Label>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {deleteTarget.document_title}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {deleteTarget.section_count} section
                {deleteTarget.section_count !== 1 ? 's' : ''} will be deleted
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
