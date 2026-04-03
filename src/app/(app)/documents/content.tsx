'use client'

import { customTheme, useGraphContext, useIsRepository } from '@/lib/core'
import { useToast } from '@/lib/core/hooks/use-toast'
import { Spinner as AppSpinner } from '@/lib/core/ui-components'
import type { Monaco } from '@monaco-editor/react'
import type {
  DocumentDetailResponse,
  DocumentListItem,
} from '@robosystems/client'
import {
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
  uploadDocument,
} from '@robosystems/client'
import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  TextInput,
  Tooltip,
} from 'flowbite-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import {
  HiArrowLeft,
  HiDocumentAdd,
  HiDocumentText,
  HiExclamation,
  HiPencil,
  HiPlus,
  HiRefresh,
  HiSave,
  HiTrash,
  HiX,
} from 'react-icons/hi'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

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

// --- Markdown Viewer ---

function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-base dark:prose-dark max-w-none px-6 py-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

// --- Monaco Editor Options ---

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: 'all' as const,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  smoothScrolling: true,
}

async function setupMonacoTheme(monaco: Monaco) {
  const { robosystemsTheme } = await import('@/lib/monaco-theme')
  monaco.editor.defineTheme('robosystems', robosystemsTheme)
  monaco.editor.setTheme('robosystems')
}

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

  // Detail/editor view state
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetailResponse | null>(
    null
  )
  const [detailLoading, setDetailLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewDocument, setIsNewDocument] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editFolder, setEditFolder] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Delete confirm state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentListItem | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // --- Computed ---

  const isInDetailView = selectedDoc !== null || detailLoading || isNewDocument
  const canEdit =
    !isRepository &&
    (isNewDocument || selectedDoc?.source_type === 'uploaded_doc')

  // --- Data Fetching ---

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

        if (!response.data) {
          throw new Error('Failed to fetch documents')
        }

        setDocuments(response.data.documents || [])
        setTotalDocuments(response.data.total || 0)
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load documents'
        setError(msg)
        showError(msg, 8000)
      } finally {
        setLoading(false)
      }
    },
    [selectedGraphId, showError]
  )

  useEffect(() => {
    fetchDocuments(true)
  }, [fetchDocuments])

  // --- Navigation ---

  const goBackToList = () => {
    if (isEditMode && hasChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return
    }
    setSelectedDoc(null)
    setIsEditMode(false)
    setIsNewDocument(false)
    setHasChanges(false)
  }

  const handleSelectDocument = async (
    doc: DocumentListItem
  ): Promise<boolean> => {
    if (!selectedGraphId) return false

    setDetailLoading(true)
    setIsEditMode(false)
    setIsNewDocument(false)
    setHasChanges(false)

    try {
      const response = await getDocument({
        path: { graph_id: selectedGraphId, document_id: doc.id },
      })

      if (!response.data) {
        throw new Error('Failed to load document')
      }

      setSelectedDoc(response.data)
      setEditContent(response.data.content)
      setEditTitle(response.data.title)
      setEditTags(response.data.tags || [])
      setEditFolder(response.data.folder || '')
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load document'
      showError(msg, 5000)
      return false
    } finally {
      setDetailLoading(false)
    }
  }

  const handleNewDocument = () => {
    setSelectedDoc(null)
    setIsNewDocument(true)
    setIsEditMode(true)
    setEditTitle('')
    setEditContent('')
    setEditTags([])
    setEditFolder('')
    setTagInput('')
    setHasChanges(false)
  }

  // --- Toggle Edit Mode ---

  const enterEditMode = () => {
    if (!selectedDoc) return
    setEditContent(selectedDoc.content)
    setEditTitle(selectedDoc.title)
    setEditTags(selectedDoc.tags || [])
    setEditFolder(selectedDoc.folder || '')
    setTagInput('')
    setHasChanges(false)
    setIsEditMode(true)
  }

  const exitEditMode = () => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return
    }
    if (isNewDocument) {
      setIsNewDocument(false)
      setIsEditMode(false)
      setSelectedDoc(null)
    } else {
      setIsEditMode(false)
    }
    setHasChanges(false)
  }

  // --- Save Handler (create or update) ---

  const handleSave = async () => {
    if (!selectedGraphId || !editTitle.trim() || !editContent.trim()) return

    try {
      setSaving(true)

      if (isNewDocument) {
        const response = await uploadDocument({
          path: { graph_id: selectedGraphId },
          body: {
            title: editTitle.trim(),
            content: editContent,
            tags: editTags.length > 0 ? editTags : null,
            folder: editFolder.trim() || null,
          },
        })

        if (response.data) {
          showSuccess(
            `Created "${editTitle.trim()}" (${response.data.sections_indexed} sections)`,
            5000
          )

          const created = await getDocument({
            path: { graph_id: selectedGraphId, document_id: response.data.id },
          })
          if (created.data) {
            setSelectedDoc(created.data)
          }

          setIsNewDocument(false)
          setIsEditMode(false)
          setHasChanges(false)
          fetchDocuments()
        } else {
          throw new Error(
            response.error ? JSON.stringify(response.error) : 'Upload failed'
          )
        }
      } else if (selectedDoc) {
        const response = await updateDocument({
          path: {
            graph_id: selectedGraphId,
            document_id: selectedDoc.id,
          },
          body: {
            title: editTitle.trim() || undefined,
            content: editContent || undefined,
            tags: editTags.length > 0 ? editTags : null,
            folder: editFolder.trim() || null,
          },
        })

        if (response.data) {
          showSuccess(
            `Saved "${editTitle.trim()}" (${response.data.sections_indexed} sections)`,
            5000
          )

          const refreshed = await getDocument({
            path: { graph_id: selectedGraphId, document_id: selectedDoc.id },
          })
          if (refreshed.data) {
            setSelectedDoc(refreshed.data)
          }

          setIsEditMode(false)
          setHasChanges(false)
          fetchDocuments()
        } else {
          throw new Error(
            response.error ? JSON.stringify(response.error) : 'Save failed'
          )
        }
      }
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
        path: {
          graph_id: selectedGraphId,
          document_id: deleteTarget.id,
        },
      })

      if (
        response.response.status === 204 ||
        response.response.status === 404
      ) {
        showSuccess(`Deleted "${deleteTarget.document_title}"`, 5000)
        setShowDeleteModal(false)
        setDeleteTarget(null)

        if (selectedDoc?.id === deleteTarget.id) {
          setSelectedDoc(null)
          setIsEditMode(false)
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

  // --- Tag Input Handler ---

  const handleAddTag = () => {
    const val = tagInput.trim().toLowerCase()
    if (val && !editTags.includes(val)) {
      setEditTags([...editTags, val])
      setHasChanges(true)
    }
    setTagInput('')
  }

  // --- Loading State ---

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" />
      </div>
    )
  }

  // --- No Graph Selected ---

  if (!selectedGraphId) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card theme={customTheme.card}>
          <div className="py-12 text-center">
            <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No graph selected
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please select a graph to manage your knowledge base.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // --- Error State ---

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card theme={customTheme.card}>
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
      </div>
    )
  }

  // --- Document Detail / Editor View ---

  if (isInDetailView) {
    const displayTitle = isEditMode ? editTitle : selectedDoc?.title || ''

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
            {isEditMode ? (
              <TextInput
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value)
                  setHasChanges(true)
                }}
                placeholder="Document title..."
                className="flex-1"
              />
            ) : (
              <h1 className="min-w-0 flex-1 text-2xl font-bold text-gray-900 dark:text-white">
                {displayTitle}
              </h1>
            )}
          </div>
          {canEdit && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {isEditMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={
                      saving || !editTitle.trim() || !editContent.trim()
                    }
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiSave className="mr-1 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    color="gray"
                    onClick={exitEditMode}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" color="gray" onClick={enterEditMode}>
                    <HiPencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => {
                      const listItem = documents.find(
                        (d) => d.id === selectedDoc?.id
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Properties Bar */}
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-zinc-800/50">
          {/* Row 1: Folder */}
          <div className="flex items-center gap-4">
            <span className="w-12 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
              Folder
            </span>
            {isEditMode ? (
              <TextInput
                sizing="sm"
                value={editFolder}
                onChange={(e) => {
                  setEditFolder(e.target.value)
                  setHasChanges(true)
                }}
                placeholder="optional"
                className="w-28"
              />
            ) : selectedDoc?.folder ? (
              <Badge color="gray" size="sm">
                {selectedDoc.folder}
              </Badge>
            ) : (
              <span className="text-xs text-gray-400">none</span>
            )}
            <div className="flex-1" />
            {!isNewDocument && selectedDoc && (
              <SourceBadge sourceType={selectedDoc.source_type} />
            )}
            {!isEditMode && selectedDoc && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedDoc.sections_indexed} section
                {selectedDoc.sections_indexed !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {/* Row 2: Tags */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-12 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
              Tags
            </span>
            {isEditMode ? (
              <>
                {editTags.map((tag) => (
                  <Badge
                    key={tag}
                    color="info"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center"
                      onClick={() => {
                        setEditTags(editTags.filter((t) => t !== tag))
                        setHasChanges(true)
                      }}
                    >
                      <HiX className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <TextInput
                  sizing="sm"
                  placeholder="add..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="w-24 flex-shrink-0"
                />
              </>
            ) : selectedDoc?.tags && selectedDoc.tags.length > 0 ? (
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

        {/* Content Area */}
        <Card theme={customTheme.card} className="min-h-0 flex-1">
          {detailLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : isEditMode ? (
            <div className="h-full">
              <Editor
                height="100%"
                language="markdown"
                value={editContent}
                onChange={(value) => {
                  setEditContent(value || '')
                  setHasChanges(true)
                }}
                beforeMount={setupMonacoTheme}
                options={EDITOR_OPTIONS}
              />
            </div>
          ) : selectedDoc ? (
            <div className="h-full overflow-y-auto">
              <MarkdownViewer content={selectedDoc.content} />
            </div>
          ) : null}
        </Card>

        <ToastContainer />
      </div>
    )
  }

  // --- Document List View ---

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiDocumentText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              Knowledge Base
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} indexed
            </p>
          </div>
        </div>
        {!isRepository && (
          <Button onClick={handleNewDocument}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        )}
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card theme={customTheme.card}>
          <div className="py-12 text-center">
            <HiDocumentAdd className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="font-medium text-gray-700 dark:text-gray-200">
              Knowledge base is empty
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isRepository
                ? 'No documents have been indexed yet.'
                : 'Upload policies, procedures, or reference documents to build your knowledge base.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              theme={customTheme.card}
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
                          onClick={async () => {
                            const success = await handleSelectDocument(doc)
                            if (success) setIsEditMode(true)
                          }}
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
      <Modal
        theme={customTheme.modal}
        show={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        size="md"
      >
        <ModalHeader>Delete Document</ModalHeader>
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button
            theme={customTheme.button}
            color="failure"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </div>
  )
}
