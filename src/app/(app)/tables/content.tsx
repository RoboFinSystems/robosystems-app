'use client'

import { customTheme, useGraphContext } from '@/lib/core'
import { normalizeLocalUrl } from '@/lib/utils'
import Editor from '@monaco-editor/react'
import * as SDK from '@robosystems/client'
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  Tabs,
  TextInput,
} from 'flowbite-react'
import { useCallback, useEffect, useState } from 'react'
import {
  HiChip,
  HiCloudUpload,
  HiDatabase,
  HiInformationCircle,
  HiPlay,
  HiTable,
  HiTrash,
} from 'react-icons/hi'
import type { FileInfo, QueryResult, TableInfo } from './types'

export function TablesContent() {
  const { state: graphState } = useGraphContext()
  const graphId = graphState.currentGraphId

  // State
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)
  const [tableFiles, setTableFiles] = useState<FileInfo[]>([])
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [tablePreview, setTablePreview] = useState<QueryResult | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showIngestModal, setShowIngestModal] = useState(false)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [tableName, setTableName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [useExistingTable, setUseExistingTable] = useState(false)
  const [selectedExistingTable, setSelectedExistingTable] = useState('')

  // Ingest state
  const [ingesting, setIngesting] = useState(false)
  const [ingestOptions, setIngestOptions] = useState({
    rebuild: false,
    ignoreErrors: true,
  })

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load tables
  const fetchTables = useCallback(async () => {
    if (!graphId) return

    try {
      setLoading(true)
      setError(null)

      const response = await SDK.listTables({
        path: { graph_id: graphId },
      })

      if (response.data) {
        const data = response.data as any
        const tableList: TableInfo[] =
          data.tables?.map((t: any) => ({
            tableName: t.table_name,
            rowCount: t.row_count || 0,
            fileCount: t.file_count || 0,
            totalSizeBytes: t.total_size_bytes || 0,
          })) || []

        setTables(tableList)

        // Auto-select first table with data if none selected
        if (!selectedTable && tableList.length > 0) {
          const firstTableWithData = tableList.find((t) => t.rowCount > 0)
          if (firstTableWithData) {
            setSelectedTable(firstTableWithData)
          } else if (tableList.length > 0) {
            setSelectedTable(tableList[0])
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err)
      setError('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }, [graphId, selectedTable])

  // Load files for selected table
  const fetchTableFiles = useCallback(
    async (table: TableInfo) => {
      if (!graphId) return

      try {
        const response = await SDK.listFiles({
          path: { graph_id: graphId },
          query: { table_name: table.tableName },
        })

        if (response.data) {
          const data = response.data as any
          setTableFiles(data.files || [])
        }
      } catch (err) {
        console.error('Failed to fetch table files:', err)
      }
    },
    [graphId]
  )

  // Load preview data for selected table
  const fetchTablePreview = useCallback(
    async (table: TableInfo) => {
      if (!graphId) return

      try {
        setLoadingPreview(true)
        const response = await SDK.queryTables({
          path: { graph_id: graphId },
          body: { sql: `SELECT * FROM ${table.tableName} LIMIT 10` },
        })

        if (response.data) {
          const data = response.data as any
          setTablePreview({
            columns: data.columns || [],
            rows: data.rows || [],
            executionTime: 0,
            rowCount: data.rows?.length || 0,
          })
        }
      } catch (err) {
        console.error('Failed to fetch table preview:', err)
        setTablePreview(null)
      } finally {
        setLoadingPreview(false)
      }
    },
    [graphId]
  )

  // Execute SQL query
  const executeQuery = async () => {
    if (!graphId || !sqlQuery.trim()) return

    try {
      setLoading(true)
      setError(null)
      setQueryResult(null)

      const startTime = Date.now()
      const response = await SDK.queryTables({
        path: { graph_id: graphId },
        body: { sql: sqlQuery },
      })

      const executionTime = Date.now() - startTime

      if (response.data) {
        const data = response.data as any
        setQueryResult({
          columns: data.columns || [],
          rows: data.rows || [],
          executionTime,
          rowCount: data.rows?.length || 0,
        })
      } else if (response.error) {
        setError('Query failed: ' + JSON.stringify(response.error))
      }
    } catch (err) {
      console.error('Query execution failed:', err)
      setError('Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  // Upload file
  const handleUpload = async () => {
    const finalTableName = useExistingTable ? selectedExistingTable : tableName
    if (!graphId || !uploadFile || !finalTableName.trim()) return

    try {
      setUploading(true)
      setError(null)

      // Step 1: Get upload URL
      const uploadUrlResponse = await SDK.createFileUpload({
        path: { graph_id: graphId },
        body: {
          table_name: finalTableName,
          file_name: uploadFile.name,
          content_type: 'application/x-parquet',
        },
      })

      if (!uploadUrlResponse.data) {
        throw new Error('Failed to get upload URL')
      }

      const uploadData = uploadUrlResponse.data as any
      const uploadUrl = normalizeLocalUrl(uploadData.upload_url)
      const fileId = uploadData.file_id

      // Step 2: Upload to S3
      const fileBuffer = await uploadFile.arrayBuffer()
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': 'application/x-parquet',
        },
      })

      if (!s3Response.ok) {
        throw new Error('Failed to upload to S3')
      }

      // Step 3: Mark file as uploaded
      await SDK.updateFile({
        path: { graph_id: graphId, file_id: fileId },
        body: {
          status: 'uploaded',
        },
      })

      // Success - refresh tables
      await fetchTables()
      setShowUploadModal(false)
      setUploadFile(null)
      setTableName('')
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  // Ingest tables
  const handleIngest = async () => {
    if (!graphId) return

    try {
      setIngesting(true)
      setError(null)

      const response = await SDK.materializeGraph({
        path: { graph_id: graphId },
        body: {
          rebuild: ingestOptions.rebuild,
          ignore_errors: ingestOptions.ignoreErrors,
        },
      })

      if (response.data) {
        const data = response.data as any
        console.log('Ingest started:', data.operation_id)
        setShowIngestModal(false)
        // TODO: Monitor operation progress
      } else if (response.error) {
        setError('Ingest failed: ' + JSON.stringify(response.error))
      }
    } catch (err) {
      console.error('Ingest failed:', err)
      setError('Failed to start ingestion')
    } finally {
      setIngesting(false)
    }
  }

  // Delete file
  const handleDeleteFile = async () => {
    if (!graphId || !fileToDelete || !selectedTable) return

    try {
      setDeleting(true)
      setError(null)

      const response = await SDK.deleteFile({
        path: { graph_id: graphId, file_id: fileToDelete.file_id },
      })

      if (
        response.data ||
        (response.error && (response.error as any).status === 200)
      ) {
        setShowDeleteModal(false)
        setFileToDelete(null)

        // Refresh tables and files
        await fetchTables()
        await fetchTableFiles(selectedTable)
      } else if (response.error) {
        setError('Delete failed: ' + JSON.stringify(response.error))
      }
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to delete file')
    } finally {
      setDeleting(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (graphId) {
      fetchTables()
    }
  }, [graphId, fetchTables])

  // Load files and preview when table selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableFiles(selectedTable)
      if (selectedTable.rowCount > 0) {
        fetchTablePreview(selectedTable)
      } else {
        setTablePreview(null)
      }
    }
  }, [selectedTable, fetchTableFiles, fetchTablePreview])

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Sample queries
  const sampleQueries = [
    { label: 'List all tables', sql: 'SHOW TABLES' },
    {
      label: 'Table info',
      sql: selectedTable
        ? `DESCRIBE ${selectedTable.tableName}`
        : 'SHOW TABLES',
    },
    {
      label: 'Preview data',
      sql: selectedTable
        ? `SELECT * FROM ${selectedTable.tableName} LIMIT 10`
        : 'SHOW TABLES',
    },
    {
      label: 'Row count',
      sql: selectedTable
        ? `SELECT COUNT(*) as total FROM ${selectedTable.tableName}`
        : 'SHOW TABLES',
    },
  ]

  if (!graphId) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Alert color="warning" icon={HiInformationCircle}>
          Please select a graph to manage tables
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiTable className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              Data Lake
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage staging tables and files
            </p>
          </div>
        </div>

        {/* Ingest Button */}
        <Button
          color="green"
          onClick={() => setShowIngestModal(true)}
          disabled={tables.length === 0}
        >
          <HiChip className="mr-2 h-4 w-4" />
          Ingest to Graph
        </Button>
      </div>

      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Tables
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tables.length}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Rows
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tables.reduce((sum, t) => sum + t.rowCount, 0).toLocaleString()}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Files
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tables.reduce((sum, t) => sum + t.fileCount, 0)}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Storage
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatBytes(
                tables.reduce((sum, t) => sum + t.totalSizeBytes, 0)
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Data Lake tabs"
        theme={customTheme.tabs}
        variant="underline"
        onActiveTabChange={(tab: number) => setActiveTab(tab)}
      >
        <Tabs.Item title="Browse Tables" icon={HiTable}>
          {/* Mobile/Tablet Dropdown - Show on small/medium screens */}
          <div className="mb-4 lg:hidden">
            <Card theme={customTheme.card}>
              <Label
                htmlFor="table-select"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Select Table ({tables.length})
              </Label>
              <Select
                id="table-select"
                value={selectedTable?.tableName || ''}
                onChange={(e) => {
                  const table = tables.find(
                    (t) => t.tableName === e.target.value
                  )
                  if (table) setSelectedTable(table)
                }}
              >
                <option value="">Choose a table...</option>
                {tables.filter((t) => t.rowCount > 0).length > 0 && (
                  <optgroup
                    label={`Active (${tables.filter((t) => t.rowCount > 0).length})`}
                  >
                    {tables
                      .filter((t) => t.rowCount > 0)
                      .map((table) => (
                        <option key={table.tableName} value={table.tableName}>
                          {table.tableName} ({table.rowCount.toLocaleString()}{' '}
                          rows, {table.fileCount} files)
                        </option>
                      ))}
                  </optgroup>
                )}
                {tables.filter((t) => t.rowCount === 0).length > 0 && (
                  <optgroup
                    label={`Empty (${tables.filter((t) => t.rowCount === 0).length})`}
                  >
                    {tables
                      .filter((t) => t.rowCount === 0)
                      .map((table) => (
                        <option key={table.tableName} value={table.tableName}>
                          {table.tableName} (No data)
                        </option>
                      ))}
                  </optgroup>
                )}
              </Select>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Table List Sidebar - Hide on small/medium, show on large screens */}
            <div className="hidden lg:col-span-4 lg:block">
              <Card theme={customTheme.card}>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Staging Tables ({tables.length})
                </h3>
                {loading && !tables.length ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    No tables found. Upload a file to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Tables */}
                    {tables.filter((t) => t.rowCount > 0).length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Active ({tables.filter((t) => t.rowCount > 0).length})
                        </h4>
                        <div className="space-y-1">
                          {tables
                            .filter((t) => t.rowCount > 0)
                            .map((table) => (
                              <button
                                key={table.tableName}
                                onClick={() => setSelectedTable(table)}
                                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                                  selectedTable?.tableName === table.tableName
                                    ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="min-w-0 truncate font-medium text-gray-900 dark:text-white">
                                  {table.tableName}
                                </div>
                                <div className="mt-1 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>
                                    {table.rowCount.toLocaleString()} rows
                                  </span>
                                  <span>{table.fileCount} files</span>
                                  <span>
                                    {formatBytes(table.totalSizeBytes)}
                                  </span>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Empty Tables */}
                    {tables.filter((t) => t.rowCount === 0).length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Empty ({tables.filter((t) => t.rowCount === 0).length}
                          )
                        </h4>
                        <div className="space-y-1">
                          {tables
                            .filter((t) => t.rowCount === 0)
                            .slice(0, 5)
                            .map((table) => (
                              <button
                                key={table.tableName}
                                onClick={() => setSelectedTable(table)}
                                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                                  selectedTable?.tableName === table.tableName
                                    ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="font-medium text-gray-500 dark:text-gray-400">
                                  {table.tableName}
                                </div>
                                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  No data
                                </div>
                              </button>
                            ))}
                          {tables.filter((t) => t.rowCount === 0).length >
                            5 && (
                            <div className="pt-1 text-center text-xs text-gray-400 dark:text-gray-500">
                              +{' '}
                              {tables.filter((t) => t.rowCount === 0).length -
                                5}{' '}
                              more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Table Details - Full width on mobile/tablet, col-span-8 on large */}
            <div className="col-span-1 lg:col-span-8">
              {selectedTable ? (
                <div className="space-y-4">
                  {/* Compact Stats */}
                  <Card theme={customTheme.card}>
                    <div className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTable.tableName}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Rows
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedTable.rowCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Files
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedTable.fileCount}
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Size
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatBytes(selectedTable.totalSizeBytes)}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Data Preview */}
                  {selectedTable.rowCount > 0 && (
                    <Card theme={customTheme.card}>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Data Preview
                        </h4>
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => {
                            const query = `SELECT * FROM ${selectedTable.tableName} LIMIT 10`
                            setSqlQuery(query)
                            setTimeout(() => {
                              setActiveTab(1)
                              const tabs =
                                document.querySelectorAll('[role="tab"]')
                              const queryTab = Array.from(tabs).find((t) =>
                                t.textContent?.includes('Query Tables')
                              )
                              if (queryTab instanceof HTMLElement) {
                                queryTab.click()
                              }
                            }, 0)
                          }}
                        >
                          <HiPlay className="mr-1 h-3 w-3" />
                          Query Table
                        </Button>
                      </div>
                      {loadingPreview ? (
                        <div className="flex justify-center py-8">
                          <Spinner size="sm" />
                        </div>
                      ) : tablePreview && tablePreview.rows.length > 0 ? (
                        <>
                          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                              <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                  {tablePreview.columns.map((col) => (
                                    <th
                                      key={col}
                                      className="px-4 py-3 font-medium"
                                    >
                                      <div className="whitespace-nowrap">
                                        {col}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tablePreview.rows.slice(0, 5).map((row, i) => (
                                  <tr
                                    key={i}
                                    className="border-b dark:border-gray-700"
                                  >
                                    {row.map((cell, j) => (
                                      <td key={j} className="px-4 py-3">
                                        <div
                                          className="max-w-[300px] min-w-[120px] truncate text-xs"
                                          title={String(cell)}
                                        >
                                          {cell === null ? (
                                            <span className="text-gray-400">
                                              NULL
                                            </span>
                                          ) : typeof cell === 'object' ? (
                                            JSON.stringify(cell)
                                          ) : (
                                            String(cell)
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                            Showing{' '}
                            {Math.min(5, tablePreview?.rows.length || 0)} of{' '}
                            {selectedTable.rowCount.toLocaleString()} rows
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No data available
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Files */}
                  <Card theme={customTheme.card}>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Files ({tableFiles.length})
                      </h4>
                      <Button
                        size="sm"
                        color="blue"
                        onClick={() => {
                          setUseExistingTable(true)
                          setSelectedExistingTable(selectedTable.tableName)
                          setShowUploadModal(true)
                        }}
                      >
                        <HiCloudUpload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                    </div>
                    {tableFiles.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No files in this table
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                          <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                              <th className="px-4 py-3 font-medium">
                                <div className="whitespace-nowrap">
                                  File Name
                                </div>
                              </th>
                              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                <div className="whitespace-nowrap">Rows</div>
                              </th>
                              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                <div className="whitespace-nowrap">Size</div>
                              </th>
                              <th className="hidden px-4 py-3 font-medium md:table-cell">
                                <div className="whitespace-nowrap">Status</div>
                              </th>
                              <th className="hidden px-4 py-3 font-medium md:table-cell">
                                <div className="whitespace-nowrap">
                                  Uploaded
                                </div>
                              </th>
                              <th className="px-4 py-3 font-medium">
                                <div className="whitespace-nowrap">Actions</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableFiles.map((file) => (
                              <tr
                                key={file.file_id}
                                className="border-b dark:border-gray-700"
                              >
                                <td className="px-4 py-3">
                                  <div
                                    className="max-w-[200px] truncate"
                                    title={file.file_name}
                                  >
                                    {file.file_name}
                                  </div>
                                </td>
                                <td className="hidden px-4 py-3 sm:table-cell">
                                  {file.row_count?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="hidden px-4 py-3 sm:table-cell">
                                  {formatBytes(file.size_bytes || 0)}
                                </td>
                                <td className="hidden px-4 py-3 md:table-cell">
                                  <Badge
                                    color={
                                      file.upload_status === 'uploaded'
                                        ? 'success'
                                        : file.upload_status === 'failed'
                                          ? 'failure'
                                          : 'warning'
                                    }
                                  >
                                    {file.upload_status}
                                  </Badge>
                                </td>
                                <td className="hidden px-4 py-3 md:table-cell">
                                  {new Date(
                                    file.created_at
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    size="xs"
                                    color="failure"
                                    onClick={() => {
                                      setFileToDelete(file)
                                      setShowDeleteModal(true)
                                    }}
                                    title="Delete file"
                                  >
                                    <HiTrash className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <Card theme={customTheme.card}>
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <HiDatabase className="mx-auto mb-4 h-12 w-12" />
                    <p>Select a table to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Tabs.Item>

        <Tabs.Item title="Query Tables" icon={HiPlay}>
          <div className="space-y-4">
            {/* Sample Queries */}
            <div className="flex gap-2">
              {sampleQueries.map((sample) => (
                <Button
                  key={sample.label}
                  size="xs"
                  color="light"
                  onClick={() => setSqlQuery(sample.sql)}
                >
                  {sample.label}
                </Button>
              ))}
            </div>

            {/* SQL Editor */}
            <Card theme={customTheme.card}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  SQL Query (DuckDB)
                </h3>
                <Button
                  size="sm"
                  onClick={executeQuery}
                  disabled={loading || !sqlQuery.trim()}
                >
                  <HiPlay className="mr-2 h-4 w-4" />
                  Execute
                </Button>
              </div>
              <Editor
                height="200px"
                defaultLanguage="sql"
                value={sqlQuery}
                onChange={(value) => setSqlQuery(value || '')}
                theme="robosystems"
                beforeMount={async (monaco) => {
                  const { robosystemsTheme } =
                    await import('@/lib/monaco-theme')
                  monaco.editor.defineTheme('robosystems', robosystemsTheme)
                  monaco.editor.setTheme('robosystems')
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  },
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  fontLigatures: true,
                }}
              />
            </Card>

            {/* Query Results */}
            {loading && (
              <Card theme={customTheme.card}>
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                  <span className="ml-2 text-gray-900 dark:text-white">
                    Executing query...
                  </span>
                </div>
              </Card>
            )}

            {queryResult && (
              <Card theme={customTheme.card}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Results ({queryResult.rowCount} rows in{' '}
                    {queryResult.executionTime}ms)
                  </h3>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="px-4 py-3 font-medium">
                            <div className="whitespace-nowrap">{col}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr key={i} className="border-b dark:border-gray-700">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3">
                              <div
                                className="max-w-[300px] min-w-[120px] truncate text-xs"
                                title={String(cell)}
                              >
                                {cell === null ? (
                                  <span className="text-gray-400">NULL</span>
                                ) : typeof cell === 'object' ? (
                                  JSON.stringify(cell)
                                ) : (
                                  String(cell)
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </Tabs.Item>
      </Tabs>

      {/* Upload Modal */}
      <Modal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        size="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUpload()
          }}
        >
          <ModalHeader>Upload Parquet File</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Alert color="info" icon={HiInformationCircle}>
                Upload Parquet files to staging tables. Files in the same table
                will be merged for querying and ingestion.
              </Alert>

              <div>
                <Label htmlFor="fileInput">Parquet File</Label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".parquet"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                  disabled={uploading}
                  required
                />
              </div>

              {selectedExistingTable ? (
                <div>
                  <Label>Target Table</Label>
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedExistingTable}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      File will be added to this table
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useExisting"
                        checked={useExistingTable}
                        onChange={(e) => {
                          setUseExistingTable(e.target.checked)
                          if (!e.target.checked) setSelectedExistingTable('')
                        }}
                        disabled={uploading || tables.length === 0}
                      />
                      <Label htmlFor="useExisting">Add to existing table</Label>
                    </div>
                    <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                      Append to an existing table or create a new one
                    </p>
                  </div>

                  {useExistingTable ? (
                    <div>
                      <Label htmlFor="tableSelect">Select Table</Label>
                      <Select
                        id="tableSelect"
                        value={selectedExistingTable}
                        onChange={(e) =>
                          setSelectedExistingTable(e.target.value)
                        }
                        disabled={uploading}
                        required
                      >
                        <option value="">Choose a table...</option>
                        {tables.map((table) => (
                          <option key={table.tableName} value={table.tableName}>
                            {table.tableName} ({table.fileCount} files,{' '}
                            {table.rowCount.toLocaleString()} rows)
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="tableName">New Table Name</Label>
                      <TextInput
                        id="tableName"
                        placeholder="e.g., companies, transactions"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        disabled={uploading}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Enter a name for the new staging table
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              color="blue"
              disabled={
                uploading ||
                !uploadFile ||
                (useExistingTable ? !selectedExistingTable : !tableName.trim())
              }
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Ingest Modal */}
      <Modal
        show={showIngestModal}
        onClose={() => setShowIngestModal(false)}
        size="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleIngest()
          }}
        >
          <ModalHeader>Ingest Tables to Graph</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Alert color="info" icon={HiInformationCircle}>
                This will load all staging tables into the graph database. The
                operation runs in the background.
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rebuild"
                    checked={ingestOptions.rebuild}
                    onChange={(e) =>
                      setIngestOptions((prev) => ({
                        ...prev,
                        rebuild: e.target.checked,
                      }))
                    }
                    disabled={ingesting}
                  />
                  <Label htmlFor="rebuild">Rebuild entire graph</Label>
                </div>
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                  Clear all existing data before ingesting (use with caution)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignoreErrors"
                    checked={ingestOptions.ignoreErrors}
                    onChange={(e) =>
                      setIngestOptions((prev) => ({
                        ...prev,
                        ignoreErrors: e.target.checked,
                      }))
                    }
                    disabled={ingesting}
                  />
                  <Label htmlFor="ignoreErrors">
                    Ignore errors during ingestion
                  </Label>
                </div>
                <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                  Continue processing even if some records fail (recommended)
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Ingestion may take several minutes
                  depending on data volume. You'll be notified when the
                  operation completes.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="green" disabled={ingesting}>
              {ingesting ? 'Starting...' : 'Start Ingestion'}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowIngestModal(false)}
              disabled={ingesting}
            >
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete File Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setFileToDelete(null)
        }}
        size="md"
      >
        <ModalHeader>Delete File</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>⚠️ Warning:</strong> This action cannot be undone. The
                file and its data will be permanently removed from the staging
                table.
              </p>
            </div>

            {fileToDelete && (
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  File Details
                </Label>
                <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Name:
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {fileToDelete.file_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Rows:
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {fileToDelete.row_count?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Size:
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatBytes(fileToDelete.size_bytes || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert color="failure" icon={HiInformationCircle}>
                {error}
              </Alert>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full gap-3">
            <Button
              color="gray"
              onClick={() => {
                setShowDeleteModal(false)
                setFileToDelete(null)
              }}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFile}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:bg-red-400 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              {deleting ? 'Deleting...' : 'Delete File'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}
