'use client'

import {
  customTheme,
  LoadingState,
  PageHeader,
  useGraphContext,
  useIsRepository,
} from '@/lib/core'
import type { GraphInfo, GraphMetricsResponse } from '@robosystems/client'
import { getGraphMetrics, getGraphs } from '@robosystems/client'
import { Alert, Badge, Card } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  HiChartBar,
  HiCloudDownload,
  HiCog,
  HiExclamationCircle,
  HiTerminal,
  HiViewGrid,
} from 'react-icons/hi'

interface DashboardData {
  graphInfo: GraphInfo
  metrics?: GraphMetricsResponse
  metricsError?: string
}

export function GraphDashboardContent() {
  const router = useRouter()
  const { state: graphState } = useGraphContext()
  const graphId = graphState.currentGraphId
  const { isRepository, currentGraph } = useIsRepository()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (graphId) {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get basic graph info
      const graphsResponse = await getGraphs()
      const graphInfo = graphsResponse.data?.graphs?.find(
        (g: GraphInfo) => g.graphId === graphId
      )

      if (!graphInfo) {
        setError('Graph or repository not found')
        setLoading(false)
        return
      }

      const dashboardData: DashboardData = {
        graphInfo,
      }

      // Only fetch metrics for user graphs, not repositories
      // Repositories don't have metrics and the API call times out
      if (!graphInfo.isRepository) {
        try {
          const metricsResponse = await getGraphMetrics({
            path: { graph_id: graphId },
          })
          if (metricsResponse.data) {
            dashboardData.metrics = metricsResponse.data
          }
        } catch (err) {
          // Metrics not available
          dashboardData.metricsError = 'Metrics not available'
          console.log('Metrics not available:', err)
        }
      } else {
        // Skip metrics for repositories
        dashboardData.metricsError = 'Metrics not available for repositories'
      }

      setData(dashboardData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'purple'
      case 'owner':
        return 'purple'
      case 'member':
        return 'info'
      case 'viewer':
      case 'read':
        return 'gray'
      default:
        return 'gray'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <LoadingState message="Loading dashboard..." />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Alert color="failure" icon={HiExclamationCircle}>
          <span className="font-medium">Error loading dashboard</span>
          <p className="mt-1 text-sm">{error || 'No data available'}</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <PageHeader
        icon={HiViewGrid}
        title={data.graphInfo.graphName}
        subtitle="View metrics and manage your graph"
        actions={
          isRepository && (
            <div className="flex flex-wrap gap-2">
              <Badge color="info">Shared Repository</Badge>
            </div>
          )
        }
      />

      {/* Metrics Overview - Only show if we have metrics */}
      {data.metrics && (
        <>
          <div className="flex items-center">
            <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
              {isRepository ? 'Repository' : 'Graph'} Metrics
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
            <Card theme={customTheme.card}>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Nodes
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.metrics.total_nodes)}
                </div>
              </div>
            </Card>

            <Card theme={customTheme.card}>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Relationships
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.metrics.total_relationships)}
                </div>
              </div>
            </Card>

            {!isRepository && (
              <Card theme={customTheme.card}>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Storage
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {((data.metrics as any).storage_size_gb || 0).toFixed(2)} GB
                  </div>
                </div>
              </Card>
            )}

            <Card theme={customTheme.card}>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(data.graphInfo.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Info message if metrics not available - only for user graphs */}
      {!data.metrics && data.metricsError && !isRepository && (
        <Alert color="info">
          <span className="font-medium">Limited data available</span>
          <p className="mt-1 text-sm">
            Detailed metrics are not currently available for this graph.
          </p>
        </Alert>
      )}

      {/* Basic Information */}
      <Card theme={customTheme.card}>
        <h3 className="font-heading mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {isRepository ? 'Repository' : 'Graph'} Information
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Graph ID
            </span>
            <span className="font-mono text-sm break-all text-gray-900 sm:text-right dark:text-white">
              {data.graphInfo.graphId}
            </span>
          </div>
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Name
            </span>
            <span className="text-sm font-medium text-gray-900 sm:text-right dark:text-white">
              {data.graphInfo.graphName}
            </span>
          </div>
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Graph Type
            </span>
            <span className="text-sm font-medium text-gray-900 capitalize sm:text-right dark:text-white">
              {data.graphInfo.graphType ||
                (isRepository ? 'repository' : 'generic')}
            </span>
          </div>
          {data.graphInfo.isSubgraph && (
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Subgraph
              </span>
              <Badge color="info">
                Subgraph of {data.graphInfo.parentGraphId?.substring(0, 8)}...
              </Badge>
            </div>
          )}
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Your Role
            </span>
            <Badge color={getRoleBadgeColor(data.graphInfo.role)}>
              {data.graphInfo.role}
            </Badge>
          </div>
          {data.graphInfo.schemaExtensions &&
            data.graphInfo.schemaExtensions.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Schema Extensions
                </span>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {data.graphInfo.schemaExtensions.map((ext) => (
                    <Badge key={ext} color="purple">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          {!isRepository && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created
              </span>
              <span className="text-sm font-medium text-gray-900 sm:text-right dark:text-white">
                {new Date(data.graphInfo.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={() => router.push('/console')}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white/80 p-6 text-left shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-300 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
        >
          <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-3">
            <HiTerminal className="text-primary-600 dark:text-primary-400 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Console
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Query and explore
            </p>
          </div>
        </button>
        <button
          onClick={() => router.push('/backups')}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white/80 p-6 text-left shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-300 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
        >
          <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
            <HiCloudDownload className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Backups
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRepository ? 'Download snapshots' : 'Manage backups'}
            </p>
          </div>
        </button>
        <button
          onClick={() => router.push('/usage')}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white/80 p-6 text-left shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-300 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
        >
          <div className="bg-secondary-100 dark:bg-secondary-900 rounded-lg p-3">
            <HiChartBar className="text-secondary-600 dark:text-secondary-400 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Usage
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor consumption
            </p>
          </div>
        </button>
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white/80 p-6 text-left shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-300 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
        >
          <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
            <HiCog className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              API keys & config
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
