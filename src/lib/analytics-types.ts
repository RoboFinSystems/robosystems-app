// Extended types for analytics data that aren't fully typed in the generated SDK

export interface CompanyGraphsUsage {
  current: number
  limit: number
  remaining: number
}

export interface TrialInfo {
  is_trial_user: boolean
  trial_expired: boolean
  days_remaining?: number
}

export interface ApiLimits {
  max_api_calls_per_hour?: number
  max_sec_imports_per_day?: number
}

export interface UsageVsLimits {
  company_graphs: CompanyGraphsUsage
  trial_info: TrialInfo
  api_limits: ApiLimits
}

export interface ApiUsage {
  total_api_keys: number
  active_api_keys: number
  last_api_key_used?: string
  api_keys: Array<{
    id: string
    name: string
    is_active: boolean
    last_used_at?: string
    created_at: string
  }>
}

export interface GraphUsage {
  company_graphs: CompanyGraphsUsage
  trial_info: TrialInfo
  total_nodes?: number
  total_relationships?: number
  detailed_metrics_available?: boolean
}

export interface UserInfo {
  id: string
  email?: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Limits {
  max_company_graphs: number
  trial_period_days?: number
  is_trial_user: boolean
  max_api_calls_per_hour?: number
  max_sec_imports_per_day?: number
  trial_started_at?: string
}

// Extended versions of the SDK types with proper typing
export interface ExtendedUsageSummaryResponse {
  user_id?: string
  graph_count: number
  total_nodes: number
  total_relationships: number
  usage_vs_limits: UsageVsLimits
  timestamp: string
}

export interface ExtendedUserUsageResponse {
  user_id: string
  company_graphs: CompanyGraphsUsage
  trial_info: TrialInfo
  limits: Limits
}

export interface ExtendedUserUsageStatsResponse {
  user_info: UserInfo
  graph_usage: GraphUsage
  api_usage: ApiUsage
  limits: Limits
  timestamp: string
}
