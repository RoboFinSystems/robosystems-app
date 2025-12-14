'use client'

import { customTheme, useGraphContext, useIsRepository } from '@/lib/core'
import type { GraphInfo, GraphMetricsResponse } from '@robosystems/client'
import { getGraphMetrics, getGraphs } from '@robosystems/client'
import { Alert, Badge, Card, Spinner } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  HiChartBar,
  HiDatabase,
  HiExclamationCircle,
  HiServer,
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiViewGrid className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              {data.graphInfo.graphName}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View metrics and manage your graph
            </p>
          </div>
        </div>
        {isRepository && (
          <div className="flex flex-wrap gap-2">
            <Badge color="info">Shared Repository</Badge>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/console">
          <Card
            theme={customTheme.card}
            className="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <HiTerminal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                Console
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Execute queries
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/usage">
          <Card
            theme={customTheme.card}
            className="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <HiChartBar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                Usage
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View insights
              </p>
            </div>
          </Card>
        </Link>

        {/* Only show these for user graphs, not repositories */}
        {!isRepository && (
          <>
            <Link href="/schema">
              <Card
                theme={customTheme.card}
                className="cursor-pointer transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="mb-3 rounded-lg bg-green-100 p-3 dark:bg-green-900">
                    <HiDatabase className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                    Schema
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage schema
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/backups">
              <Card
                theme={customTheme.card}
                className="cursor-pointer transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="mb-3 rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900">
                    <HiServer className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                    Backups
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage backups
                  </p>
                </div>
              </Card>
            </Link>
          </>
        )}
      </div>

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

      {/* Info message if metrics not available */}
      {!data.metrics && data.metricsError && (
        <Alert color="info">
          <span className="font-medium">Limited data available</span>
          <p className="mt-1 text-sm">
            {isRepository
              ? 'Detailed metrics are not available for shared repositories. You can still query the repository data using the Console.'
              : 'Detailed metrics are not currently available for this graph.'}
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
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Schema Extensions
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.graphInfo.schemaExtensions.map((ext) => (
                    <Badge key={ext} color="purple">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:justify-between dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created
            </span>
            <span className="text-sm font-medium text-gray-900 sm:text-right dark:text-white">
              {new Date(data.graphInfo.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Graph ID
            </span>
            <span className="font-mono text-sm break-all text-gray-900 dark:text-white">
              {data.graphInfo.graphId}
            </span>
          </div>
        </div>
      </Card>

      {/* Getting Started - For repositories */}
      {isRepository && (
        <Card theme={customTheme.card}>
          <h3 className="font-heading mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Working with Shared Repositories
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Shared repositories provide read-only access to curated datasets.
              You can query the data but cannot modify the schema or create
              backups.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <HiTerminal className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Query Data
                  </p>
                  <p>Use the Console to execute queries and explore the data</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HiChartBar className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Monitor Usage
                  </p>
                  <p>Track your credit consumption in the Usage section</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
