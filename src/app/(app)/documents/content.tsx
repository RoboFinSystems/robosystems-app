'use client'

import { customTheme, useGraphContext, useIsRepository } from '@/lib/core'
import { useToast } from '@/lib/core/hooks/use-toast'
import { Spinner as AppSpinner } from '@/lib/core/ui-components'
import type { DocumentListItem, DocumentSection } from '@robosystems/client'
import {
  deleteDocument,
  getDocumentSection,
  listDocuments,
  searchDocuments,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Textarea,
  TextInput,
  Tooltip,
} from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import {
  HiDocumentAdd,
  HiDocumentText,
  HiExclamation,
  HiEye,
  HiPencil,
  HiPlus,
  HiRefresh,
  HiTrash,
  HiX,
} from 'react-icons/hi'

// --- Types ---

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

// --- Tag Input Component ---

function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} color="info" size="sm">
            {tag}
            <button
              type="button"
              className="ml-1 inline-flex items-center"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
            >
              <HiX className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput
          sizing="sm"
          placeholder="Add a tag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          className="flex-1"
        />
        <Button
          size="sm"
          color="gray"
          onClick={addTag}
          disabled={!input.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  )
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

  // Upload/Edit modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadContent, setUploadContent] = useState('')
  const [uploadTags, setUploadTags] = useState<string[]>([])
  const [uploadFolder, setUploadFolder] = useState('')
  const [uploading, setUploading] = useState(false)

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentSection | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Delete confirm state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentListItem | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

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

  // --- Upload Handler ---

  const handleUpload = async () => {
    if (!selectedGraphId || !uploadTitle.trim() || !uploadContent.trim()) return

    try {
      setUploading(true)

      const response = await uploadDocument({
        path: { graph_id: selectedGraphId },
        body: {
          title: uploadTitle.trim(),
          content: uploadContent,
          tags: uploadTags.length > 0 ? uploadTags : null,
          folder: uploadFolder.trim() || null,
        },
      })

      if (response.data) {
        showSuccess(
          `${isEditing ? 'Updated' : 'Uploaded'} "${uploadTitle.trim()}" (${response.data.sections_indexed} sections)`,
          5000
        )
        setShowUploadModal(false)
        setIsEditing(false)
        resetUploadForm()
        setTimeout(() => fetchDocuments(), 500)
      } else {
        const errMsg =
          response.error && typeof response.error === 'object'
            ? JSON.stringify(response.error)
            : String(response.error || 'Upload failed')
        throw new Error(errMsg)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      showError(msg, 8000)
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadTitle('')
    setUploadContent('')
    setUploadTags([])
    setUploadFolder('')
  }

  // --- Edit Handler ---

  const handleEdit = async (doc: DocumentListItem) => {
    if (!selectedGraphId) return

    resetUploadForm()
    setIsEditing(true)
    setEditLoading(true)
    setShowUploadModal(true)

    // Pre-populate metadata from list item
    setUploadTitle(doc.document_title)
    setUploadFolder(doc.folder || '')
    setUploadTags(doc.tags || [])

    try {
      // Fetch all sections for this document to reconstruct the full content
      const searchResponse = await searchDocuments({
        path: { graph_id: selectedGraphId },
        body: {
          query: doc.document_title,
          source_type: 'uploaded_doc',
          size: 50,
        },
      })

      if (!searchResponse.data?.hits?.length) {
        throw new Error('No sections found for this document')
      }

      // Fetch full content for each section
      const sectionContents = await Promise.all(
        searchResponse.data.hits.map(async (hit) => {
          const res = await getDocumentSection({
            path: { graph_id: selectedGraphId!, document_id: hit.document_id },
          })
          return res.data
        })
      )

      // Reconstruct the document by joining section contents
      const fullContent = sectionContents
        .filter((s): s is DocumentSection => s != null)
        .map((s) => s.content)
        .join('\n\n')

      setUploadContent(fullContent)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to load document for editing'
      showError(msg, 5000)
      setShowUploadModal(false)
      setIsEditing(false)
    } finally {
      setEditLoading(false)
    }
  }

  // --- Preview Handler ---

  const handlePreview = async (doc: DocumentListItem) => {
    if (!selectedGraphId) return

    setShowPreviewModal(true)
    setPreviewLoading(true)
    setPreviewDoc(null)

    try {
      const docTitle = doc.document_title
      const searchResponse = await searchDocuments({
        path: { graph_id: selectedGraphId },
        body: {
          query: docTitle,
          source_type: doc.source_type || undefined,
          size: 1,
        },
      })

      if (searchResponse.data?.hits?.length) {
        const hit = searchResponse.data.hits[0]
        const sectionResponse = await getDocumentSection({
          path: {
            graph_id: selectedGraphId,
            document_id: hit.document_id,
          },
        })

        if (sectionResponse.data) {
          setPreviewDoc(sectionResponse.data)
        } else {
          throw new Error('Section not found')
        }
      } else {
        throw new Error('No sections found for this document')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load preview'
      showError(msg, 5000)
      setShowPreviewModal(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  // --- Delete Handler ---

  const handleDelete = async () => {
    if (!selectedGraphId || !deleteTarget) return

    try {
      setDeleting(true)

      // Use the document_id (base prefix) from the list response
      const docId =
        (deleteTarget as any).document_id || deleteTarget.document_title

      const response = await deleteDocument({
        path: {
          graph_id: selectedGraphId,
          document_id: docId,
        },
      })

      // 204 = deleted, 404 = not found (already deleted)
      if (
        response.response.status === 204 ||
        response.response.status === 404
      ) {
        showSuccess(`Deleted "${deleteTarget.document_title}"`, 5000)
        setShowDeleteModal(false)
        setDeleteTarget(null)
        setTimeout(() => fetchDocuments(), 500)
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

  // --- Source Type Badge ---

  const getSourceBadge = (sourceType: string) => {
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

  // --- Main Render ---

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
        <div className="flex gap-2">
          {!isRepository && (
            <Button
              onClick={() => {
                resetUploadForm()
                setShowUploadModal(true)
              }}
            >
              <HiPlus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {/* Document Table */}
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
        <Card theme={customTheme.card}>
          <Table>
            <TableHead>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Sections</TableHeadCell>
              <TableHeadCell>Folder</TableHeadCell>
              <TableHeadCell>Tags</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {documents.map((doc, idx) => (
                <TableRow
                  key={`${doc.document_title}-${idx}`}
                  className="bg-white dark:border-gray-700 dark:bg-zinc-800"
                >
                  <TableCell className="max-w-xs truncate font-medium">
                    {doc.document_title}
                  </TableCell>
                  <TableCell>{getSourceBadge(doc.source_type)}</TableCell>
                  <TableCell>{doc.section_count}</TableCell>
                  <TableCell>
                    {doc.folder ? (
                      <Badge color="gray" size="sm">
                        {doc.folder}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags && doc.tags.length > 0 ? (
                        doc.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} color="gray" size="sm">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {doc.tags && doc.tags.length > 3 && (
                        <Badge color="gray" size="sm">
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Tooltip content="Preview">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => handlePreview(doc)}
                        >
                          <HiEye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      {!isRepository && doc.source_type === 'uploaded_doc' && (
                        <Tooltip content="Edit">
                          <Button
                            size="sm"
                            color="gray"
                            onClick={() => handleEdit(doc)}
                          >
                            <HiPencil className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                      {!isRepository && doc.source_type === 'uploaded_doc' && (
                        <Tooltip content="Delete">
                          <Button
                            size="sm"
                            color="gray"
                            onClick={() => {
                              setDeleteTarget(doc)
                              setShowDeleteModal(true)
                            }}
                          >
                            <HiTrash className="h-4 w-4 text-red-500" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Upload Document Modal */}
      <Modal
        theme={customTheme.modal}
        show={showUploadModal}
        onClose={() => {
          if (!uploading) {
            setShowUploadModal(false)
            setIsEditing(false)
          }
        }}
        size="xl"
      >
        <ModalHeader>
          {isEditing ? 'Edit Document' : 'Upload Document'}
        </ModalHeader>
        <ModalBody>
          {editLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading document...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="doc-title"
                  placeholder="e.g., Revenue Recognition Policy"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div>
                <Label htmlFor="doc-folder">Folder</Label>
                <TextInput
                  id="doc-folder"
                  placeholder="e.g., policies, procedures, analysis"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div>
                <Label>Tags</Label>
                <TagInput tags={uploadTags} onChange={setUploadTags} />
              </div>
              <div>
                <Label htmlFor="doc-content">
                  Content (Markdown) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="doc-content"
                  placeholder="# Heading&#10;&#10;Your markdown content here..."
                  rows={12}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  disabled={uploading}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use markdown headings (#, ##, ###) to create searchable
                  sections.
                  {uploadContent.length > 0 && (
                    <span className="ml-2">
                      {uploadContent.length.toLocaleString()} characters
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {!editLoading && (
            <>
              <Button
                onClick={handleUpload}
                disabled={
                  uploading || !uploadTitle.trim() || !uploadContent.trim()
                }
              >
                {uploading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {isEditing ? 'Saving...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <HiDocumentAdd className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save Changes' : 'Upload'}
                  </>
                )}
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setShowUploadModal(false)
                  setIsEditing(false)
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      <Modal
        theme={customTheme.modal}
        show={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        size="xl"
      >
        <ModalHeader>Document Preview</ModalHeader>
        <ModalBody>
          {previewLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : previewDoc ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getSourceBadge(previewDoc.source_type)}
                {previewDoc.section_label && (
                  <Badge color="gray" size="sm">
                    {previewDoc.section_label}
                  </Badge>
                )}
                {previewDoc.folder && (
                  <Badge color="gray" size="sm">
                    {previewDoc.folder}
                  </Badge>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-zinc-900">
                <pre className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {previewDoc.content}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No content available</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

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
                    All sections of this document will be permanently removed
                    from the search index.
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
