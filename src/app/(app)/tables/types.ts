// Type definitions for tables management interface

export interface TableInfo {
  tableName: string
  rowCount: number
  fileCount: number
  totalSizeBytes: number
}

export interface FileInfo {
  file_id: string
  file_name: string
  file_format: string
  size_bytes: number
  row_count: number
  upload_status: 'pending' | 'uploaded' | 'failed'
  upload_method: string
  created_at: string
  uploaded_at: string | null
  s3_key: string
}

export interface QueryResult {
  columns: string[]
  rows: any[][]
  executionTime?: number
  rowCount?: number
}

export interface IngestStatus {
  operationId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  progress?: number
}
