export interface GraphDatabase {
  id: string
  name: string
  company_id: string
  company_name: string
  tier: 'standard' | 'enterprise' | 'premium'
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  storage_gb: number
  nodes_count: number
  edges_count: number
  last_accessed: string
  credits_consumed_today: number
  credits_consumed_month: number
  credit_balance: number
  monthly_allocation: number
}

export interface GraphCreationRequest {
  name: string
  company_id: string
  tier: 'standard' | 'enterprise' | 'premium'
  initial_schema?: string
  description?: string
}

export interface GraphSettings {
  id: string
  name: string
  description?: string
  tier: 'standard' | 'enterprise' | 'premium'
  backup_enabled: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  backup_retention_days: number
  query_timeout_seconds: number
  max_concurrent_queries: number
  allowed_ips?: string[]
  webhook_url?: string
  webhook_events?: string[]
}
