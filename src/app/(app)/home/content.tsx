'use client'

import { customTheme, PageLayout, useGraphContext } from '@/lib/core'
import type { GraphInfo } from '@robosystems/client'
import { getGraphs } from '@robosystems/client'
import {
  Badge,
  Button,
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  HiChartBar,
  HiDatabase,
  HiGlobeAlt,
  HiHome,
  HiPlay,
  HiPlus,
  HiTerminal,
} from 'react-icons/hi'

export default function AllGraphsHomePage() {
  const router = useRouter()
  const { setCurrentGraph, state: graphState } = useGraphContext()
  const [graphs, setGraphs] = useState<GraphInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGraphs()
  }, [])

  const fetchGraphs = async () => {
    try {
      setLoading(true)
      const response = await getGraphs()

      if (response.data?.graphs) {
        // Show both user graphs and shared repositories, but hide subgraphs
        const mainGraphs = response.data.graphs.filter(
          (graph) => !graph.isSubgraph
        )
        setGraphs(mainGraphs)
      }
    } catch (err) {
      console.error('Failed to fetch graphs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenGraph = async (graph: GraphInfo) => {
    // Only select if not already selected
    if (graphState.currentGraphId !== graph.graphId) {
      await setCurrentGraph(graph.graphId)
    }
    router.push('/dashboard')
  }

  const handleOpenConsole = async (graph: GraphInfo) => {
    // Only select if not already selected
    if (graphState.currentGraphId !== graph.graphId) {
      await setCurrentGraph(graph.graphId)
    }
    router.push('/console')
  }

  const handleOpenUsage = async (graph: GraphInfo) => {
    // Only select if not already selected
    if (graphState.currentGraphId !== graph.graphId) {
      await setCurrentGraph(graph.graphId)
    }
    router.push('/usage')
  }

  const isActiveGraph = (graphId: string) => {
    return graphState.currentGraphId === graphId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading graphs...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiHome className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              Graphs & Repositories
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your graphs and access repositories
            </p>
          </div>
        </div>
        {graphs.length > 0 && (
          <div className="flex gap-2">
            <Button
              color="purple"
              onClick={() => router.push('/repositories/browse')}
            >
              <HiGlobeAlt className="mr-2 h-4 w-4" />
              Browse Repositories
            </Button>
            <Button onClick={() => router.push('/graphs/new')}>
              <HiPlus className="mr-2 h-4 w-4" />
              Create Graph
            </Button>
          </div>
        )}
      </div>

      {/* Graphs List - Mobile Optimized */}
      {graphs.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <Card theme={customTheme.card} className="hidden md:block">
            <div className="w-full">
              <Table>
                <TableHead>
                  <TableHeadCell>Graph / Repository</TableHeadCell>
                  <TableHeadCell>Type & Extensions</TableHeadCell>
                  <TableHeadCell>Created</TableHeadCell>
                  <TableHeadCell className="text-right">Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {graphs.map((graph) => {
                    const isActive = isActiveGraph(graph.graphId)
                    return (
                      <TableRow
                        key={graph.graphId}
                        className={`${
                          isActive
                            ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset dark:bg-blue-900/20 dark:ring-blue-400'
                            : 'bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div
                              className={`shrink-0 rounded-lg p-2 ${
                                graph.isRepository
                                  ? 'bg-purple-100 dark:bg-purple-900'
                                  : 'bg-blue-100 dark:bg-blue-900'
                              }`}
                              title={
                                graph.isRepository
                                  ? 'Shared Repository'
                                  : 'User Graph'
                              }
                            >
                              <HiDatabase
                                className={`h-4 w-4 ${
                                  graph.isRepository
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {graph.graphName}
                                </span>
                              </div>
                              <div
                                className="max-w-xs truncate font-mono text-xs text-gray-500 dark:text-gray-400"
                                title={graph.graphId}
                              >
                                {graph.graphId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-gray-700 capitalize dark:text-gray-300">
                              {graph.graphType ||
                                (graph.isRepository ? 'repository' : 'generic')}
                              {graph.isSubgraph && ' (subgraph)'}
                            </span>
                            {graph.schemaExtensions &&
                              graph.schemaExtensions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {graph.schemaExtensions.map((ext) => (
                                    <Badge key={ext} color="purple" size="sm">
                                      {ext}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400">
                          {formatDate(graph.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOpenGraph(graph)}
                              className="min-w-fit"
                            >
                              <HiPlay className="h-3 w-3 lg:mr-1" />
                              <span className="hidden xl:inline">Open</span>
                            </Button>
                            <Button
                              size="sm"
                              color="gray"
                              onClick={() => handleOpenConsole(graph)}
                              className="min-w-fit"
                              title="Console"
                            >
                              <HiTerminal className="h-3 w-3 xl:mr-1" />
                              <span className="hidden xl:inline">Console</span>
                            </Button>
                            <Button
                              size="sm"
                              color="gray"
                              onClick={() => handleOpenUsage(graph)}
                              className="hidden min-w-fit lg:flex"
                              title="Usage"
                            >
                              <HiChartBar className="h-3 w-3 xl:mr-1" />
                              <span className="hidden xl:inline">Usage</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {graphs.map((graph) => {
              const isActive = isActiveGraph(graph.graphId)
              return (
                <Card
                  key={graph.graphId}
                  theme={customTheme.card}
                  className={`p-4 ${
                    isActive
                      ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset dark:bg-blue-900/20 dark:ring-blue-400'
                      : ''
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with name */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            graph.isRepository
                              ? 'bg-purple-100 dark:bg-purple-900'
                              : 'bg-blue-100 dark:bg-blue-900'
                          }`}
                          title={
                            graph.isRepository
                              ? 'Shared Repository'
                              : 'User Graph'
                          }
                        >
                          <HiDatabase
                            className={`h-5 w-5 ${
                              graph.isRepository
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {graph.graphName}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 capitalize dark:text-gray-400">
                            {graph.graphType ||
                              (graph.isRepository ? 'repository' : 'generic')}
                            {graph.isSubgraph && ' (subgraph)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Schema Extensions */}
                    {graph.schemaExtensions &&
                      graph.schemaExtensions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {graph.schemaExtensions.map((ext) => (
                            <Badge key={ext} color="purple" size="sm">
                              {ext}
                            </Badge>
                          ))}
                        </div>
                      )}

                    {/* Graph ID & Created */}
                    <div className="space-y-2">
                      <div className="rounded-lg bg-gray-50 p-2 dark:bg-zinc-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Graph ID
                        </p>
                        <p className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                          {graph.graphId}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatDate(graph.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenGraph(graph)}
                      >
                        <HiPlay className="mr-1 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        color="gray"
                        className="flex-1"
                        onClick={() => handleOpenConsole(graph)}
                      >
                        <HiTerminal className="mr-1 h-4 w-4" />
                        Console
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card theme={customTheme.card}>
            <div className="py-12 text-center">
              <HiDatabase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No graphs or repositories found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a graph or subscribing to a shared
                repository
              </p>
            </div>
          </Card>

          {/* Getting Started Options */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Graph Card */}
            <Card
              theme={customTheme.card}
              className="transition-shadow hover:shadow-lg"
            >
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                    <HiPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                    Create Your Graph
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build your own knowledge graph database. Store and query your
                  data with full control over schema and access.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Full read/write access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Custom schema and extensions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>AI-powered operations</span>
                  </li>
                </ul>
                <Button
                  onClick={() => router.push('/graphs/new')}
                  className="w-full"
                  size="lg"
                >
                  <HiPlus className="mr-2 h-5 w-5" />
                  Create Graph
                </Button>
              </div>
            </Card>

            {/* Subscribe to Repository Card */}
            <Card
              theme={customTheme.card}
              className="transition-shadow hover:shadow-lg"
            >
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                    <HiDatabase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                    Subscribe to Repository
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access curated, read-only graph databases with pre-loaded
                  data. Perfect for research and analysis.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Pre-loaded curated data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Ready-to-query datasets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>API and MCP tool access</span>
                  </li>
                </ul>
                <Button
                  onClick={() => router.push('/repositories/browse')}
                  className="w-full"
                  size="lg"
                  color="purple"
                >
                  <HiGlobeAlt className="mr-2 h-5 w-5" />
                  Browse Repositories
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
