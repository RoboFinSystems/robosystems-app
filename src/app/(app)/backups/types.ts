// Type definitions for backup management interface

export interface BackupStats {
  graph_id: string
  total_backups: number
  successful_backups: number
  failed_backups: number
  success_rate: number
  total_original_size_bytes: number
  total_compressed_size_bytes: number
  storage_saved_bytes: number
  average_compression_ratio: number
  latest_backup_date: string | null
}

export interface Backup {
  id: string
  graph_id: string
  database_name: string
  backup_type: string
  status: string
  s3_bucket: string
  s3_key: string
  original_size_bytes: number
  compressed_size_bytes: number
  encrypted_size_bytes: number
  compression_ratio: number
  node_count: number
  relationship_count: number
  backup_duration_seconds: number
  encryption_enabled: boolean
  compression_enabled: boolean
  created_at: string
  completed_at: string | null
  expires_at: string | null
}

export type BackupFormat = 'csv' | 'json' | 'parquet' | 'full_dump'

export interface BackupCreateForm {
  backup_type: 'full' | 'incremental'
  backup_format?: BackupFormat
  retention_days: number
  compression: boolean
  encryption: boolean
}

export interface BackupRestoreForm {
  backup_id: string
  target_graph_id?: string
  drop_existing: boolean
  verify_after_restore: boolean
  create_system_backup?: boolean
}

export interface TaskStatus {
  task_id: string
  status: string
  message: string
}

export interface BackupHealth {
  status: string
  task_id: string
  message: string
  timestamp: string
}

export interface DatabaseBackupForm {
  backup_format: 'compressed' | 'tar' | 'raw'
  include_metadata: boolean
  compression_level: number
}

export interface DatabaseHealth {
  graph_id: string
  status: string
  [key: string]: any
}

export interface DatabaseInfo {
  graph_id: string
  database_name: string
  [key: string]: any
}

export type BackupStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired'
export type BackupType = 'full' | 'incremental'
