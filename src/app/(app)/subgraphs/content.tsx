'use client'

import { CopyableId } from '@/components/CopyableId'
import type {
  ListSubgraphsResponse,
  SubgraphSummary,
} from '@robosystems/client'
import {
  createBackup,
  deleteSubgraph,
  listSubgraphs,
} from '@robosystems/client'
import {
  ConfirmModal,
  EmptyState,
  LoadingState,
  PageHeader,
  PageLayout,
  StatCard,
  useGraphContext,
  useToast,
} from '@robosystems/core'
import { useOperationMonitoring } from '@robosystems/core/task-monitoring/operationHooks'
import {
  Alert,
  Button,
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
} from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  HiChip,
  HiDatabase,
  HiExclamationCircle,
  HiPlus,
  HiPuzzle,
  HiTrash,
} from 'react-icons/hi'

export function SubgraphsContent() {
  const router = useRouter()
  const { state } = useGraphContext()
  const { showSuccess, showError, showInfo } = useToast()
  const currentGraphId = state.currentGraphId
  const [subgraphs, setSubgraphs] = useState<SubgraphSummary[]>([])
  const [listResponse, setListResponse] =
    useState<ListSubgraphsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [subgraphToDelete, setSubgraphToDelete] =
    useState<SubgraphSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [backingUpId, setBackingUpId] = useState<string | null>(null)
  const backupOperationMonitor = useOperationMonitoring()

  const connectHref = (subgraph: SubgraphSummary) =>
    `/connect?workspace=${encodeURIComponent(subgraph.graph_id)}`

  const handleBackupClick = async (subgraph: SubgraphSummary) => {
    setBackingUpId(subgraph.graph_id)
    try {
      const response = await createBackup({
        path: { graph_id: subgraph.graph_id },
        body: {
          backup_format: 'full_dump',
          retention_days: 90,
        },
      })

      if (response.data) {
        const operationId = response.data.operationId
        showInfo('Backup started...', 3000)
        await backupOperationMonitor.startMonitoring(operationId)
        showSuccess(
          `Backup created for ${subgraph.display_name}. View it on the Backups page.`
        )
        backupOperationMonitor.reset()
      } else {
        throw new Error('Failed to create backup')
      }
    } catch (err: any) {
      console.error('Subgraph backup error:', err)
      if (err.status === 403) {
        showError('Backup creation is currently disabled.', 5000)
      } else {
        showError(err.message || 'Failed to create backup', 5000)
      }
    } finally {
      setBackingUpId(null)
    }
  }

  // The graph a request was issued for, readable from inside an in-flight call
  // so a response that arrives after a graph switch can be dropped.
  const loadedGraphIdRef = useRef(currentGraphId)
  useEffect(() => {
    loadedGraphIdRef.current = currentGraphId
  }, [currentGraphId])

  // Subgraphs belong to the parent graph they were listed from. A delete
  // confirm left open across a switch would send the previous parent's
  // subgraph to the new one, and the list itself would show the old parent's
  // subgraphs under the new parent's name until its own read returned.
  useEffect(() => {
    setDeleteModalOpen(false)
    setSubgraphToDelete(null)
    setSubgraphs([])
    setListResponse(null)
  }, [currentGraphId])

  const fetchSubgraphs = async () => {
    if (!currentGraphId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Fetch subgraphs list
      const response = await listSubgraphs({
        path: { graph_id: currentGraphId },
      })

      if (loadedGraphIdRef.current !== currentGraphId) return

      if (response.data) {
        setListResponse(response.data)
        setSubgraphs(response.data.subgraphs || [])
      }
    } catch (error: any) {
      if (loadedGraphIdRef.current !== currentGraphId) return
      console.error('Failed to fetch subgraphs:', error)
      showError('Failed to load subgraphs')
    } finally {
      if (loadedGraphIdRef.current === currentGraphId) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubgraphs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGraphId])

  const handleDeleteClick = (subgraph: SubgraphSummary) => {
    setSubgraphToDelete(subgraph)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subgraphToDelete || !currentGraphId) return

    setIsDeleting(true)
    try {
      await deleteSubgraph({
        path: { graph_id: currentGraphId },
        body: {
          subgraph_name: subgraphToDelete.subgraph_name,
          force: true,
          backup_first: false,
        },
      })

      showSuccess(
        `Subgraph "${subgraphToDelete.display_name}" deleted successfully`
      )
      setDeleteModalOpen(false)
      setSubgraphToDelete(null)
      fetchSubgraphs()
    } catch (error: any) {
      console.error('Failed to delete subgraph:', error)
      showError(error.message || 'Failed to delete subgraph')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  /** Byte-precise when the API provides size_bytes; the MB figure is the
      fallback for servers that predate it. */
  const formatSize = (
    sizeBytes: number | null | undefined,
    sizeMb: number | null | undefined
  ) => {
    const bytes = sizeBytes ?? (sizeMb != null ? sizeMb * 1024 ** 2 : null)
    if (bytes == null) return 'N/A'
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`
  }

  const subgraphCount = listResponse?.subgraph_count ?? subgraphs.length
  const quotaValue = listResponse?.max_subgraphs
    ? `${subgraphCount} / ${listResponse.max_subgraphs}`
    : `${subgraphCount}`
  const atQuota =
    !!listResponse?.max_subgraphs && subgraphCount >= listResponse.max_subgraphs

  // No graph selected state
  if (!currentGraphId) {
    return (
      <PageLayout>
        <Alert color="warning" icon={HiExclamationCircle}>
          <span className="font-medium">No graph selected</span>
          <p className="mt-1 text-sm">
            Please select a graph from the home page to view its subgraphs.
          </p>
        </Alert>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState message="Loading subgraphs..." />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <PageHeader
        icon={HiChip}
        title="Subgraphs"
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Isolated workspaces inside{' '}
              {listResponse?.parent_graph_name || 'the selected graph'}
            </span>
            <CopyableId value={currentGraphId} label="parent graph id" />
          </span>
        }
        actions={
          <Button
            onClick={() => router.push('/subgraphs/new')}
            disabled={atQuota}
          >
            <HiPlus className="mr-2 h-4 w-4" />
            Create Subgraph
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
        <StatCard label="Subgraphs" value={quotaValue} />
        <StatCard
          label="Total Size"
          value={formatSize(
            listResponse?.total_size_bytes,
            listResponse?.total_size_mb
          )}
        />
        <StatCard
          label="Tier"
          value={
            listResponse?.parent_graph_tier
              ? listResponse.parent_graph_tier
                  .split('-')
                  .slice(-1)[0]
                  .toUpperCase()
              : 'N/A'
          }
        />
      </div>

      {atQuota && (
        <Alert color="warning" icon={HiExclamationCircle}>
          <span className="font-medium">Subgraph quota reached.</span> This
          graph is at its tier limit of {listResponse?.max_subgraphs}. Delete a
          subgraph or upgrade the tier to create another.
        </Alert>
      )}

      {/* Subgraphs List - Mobile Optimized */}
      {subgraphs.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <div className="w-full">
              <Table>
                <TableHead>
                  <TableHeadCell>Subgraph</TableHeadCell>
                  <TableHeadCell>Size</TableHeadCell>
                  <TableHeadCell>Created</TableHeadCell>
                  <TableHeadCell className="text-right">Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subgraphs.map((subgraph) => (
                    <TableRow
                      key={subgraph.graph_id}
                      className="bg-white dark:bg-zinc-800"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary-100 dark:bg-primary-900 shrink-0 rounded-lg p-2">
                            <HiChip className="text-primary-600 dark:text-primary-400 h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            {/* Block, not inline: CopyableId below is
                                inline-flex and would ride up alongside it. */}
                            <div className="truncate font-semibold">
                              {subgraph.display_name}
                            </div>
                            {/* The full id is the MCP address — visible and
                                copyable, not hidden in a tooltip. */}
                            <CopyableId
                              value={subgraph.graph_id}
                              label="subgraph id"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        <span className="text-xs">
                          {formatSize(subgraph.size_bytes, subgraph.size_mb)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {formatDate(subgraph.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(connectHref(subgraph))}
                          >
                            <HiPuzzle className="mr-2 h-4 w-4" />
                            Connect
                          </Button>
                          <Tooltip content="Create backup">
                            <Button
                              size="sm"
                              color="gray"
                              onClick={() => handleBackupClick(subgraph)}
                              disabled={backingUpId === subgraph.graph_id}
                              aria-label={`Back up ${subgraph.display_name}`}
                            >
                              {backingUpId === subgraph.graph_id ? (
                                <Spinner size="sm" />
                              ) : (
                                <HiDatabase className="h-4 w-4" />
                              )}
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete subgraph">
                            <Button
                              size="sm"
                              color="gray"
                              onClick={() => handleDeleteClick(subgraph)}
                              aria-label={`Delete ${subgraph.display_name}`}
                            >
                              <HiTrash className="h-4 w-4 text-red-500" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {subgraphs.map((subgraph) => (
              <Card key={subgraph.graph_id} className="p-4">
                <div className="space-y-3">
                  {/* Header with name */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900 shrink-0 rounded-lg p-2">
                      <HiChip className="text-primary-600 dark:text-primary-400 h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {subgraph.display_name}
                      </h3>
                      <CopyableId
                        value={subgraph.graph_id}
                        label="subgraph id"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-zinc-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Size
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatSize(subgraph.size_bytes, subgraph.size_mb)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {formatDate(subgraph.created_at)}
                    </p>
                    {subgraph.last_accessed && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last accessed {formatDate(subgraph.last_accessed)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(connectHref(subgraph))}
                    >
                      <HiPuzzle className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      onClick={() => handleBackupClick(subgraph)}
                      disabled={backingUpId === subgraph.graph_id}
                      aria-label={`Back up ${subgraph.display_name}`}
                    >
                      {backingUpId === subgraph.graph_id ? (
                        <Spinner size="sm" />
                      ) : (
                        <HiDatabase className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      onClick={() => handleDeleteClick(subgraph)}
                      aria-label={`Delete ${subgraph.display_name}`}
                    >
                      <HiTrash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={HiChip}
            title="No subgraphs found"
            description="A subgraph is an isolated, writable graph inside this one — its own schema and data, with its own MCP connector. Create one to get started."
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Subgraph"
        confirmLabel="Delete Subgraph"
        confirmIcon={HiTrash}
      >
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <HiExclamationCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">
                  This action is permanent
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the subgraph{' '}
            <strong className="text-gray-900 dark:text-white">
              {subgraphToDelete?.display_name}
            </strong>
            ?
          </p>
          {subgraphToDelete && (
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {subgraphToDelete.graph_id}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All data in this subgraph will be permanently deleted. Any MCP
            connector pointing at it will stop resolving.
          </p>
        </div>
      </ConfirmModal>
    </PageLayout>
  )
}
