'use client'

import { customTheme, useGraphContext } from '@/lib/core'
import Editor from '@monaco-editor/react'
import * as SDK from '@robosystems/client'
import { Alert, Badge, Card, Tabs, TextInput } from 'flowbite-react'
import { useEffect, useState } from 'react'
import {
  HiCode,
  HiDatabase,
  HiDocumentAdd,
  HiInformationCircle,
  HiSearch,
} from 'react-icons/hi'

interface NodeLabel {
  name: string
  properties: SchemaProperty[]
  count?: number
}

interface RelationshipType {
  name: string
  properties: SchemaProperty[]
  count?: number
  sourceLabels?: string[]
  targetLabels?: string[]
}

interface SchemaProperty {
  name: string
  type: string
  required?: boolean
  indexed?: boolean
  unique?: boolean
}

interface SchemaConstraint {
  id: string
  type: 'unique' | 'exists' | 'node_key'
  label: string
  properties: string[]
}

interface SchemaIndex {
  id: string
  type: 'btree' | 'fulltext' | 'vector'
  label: string
  properties: string[]
  state: 'online' | 'building' | 'failed'
}

export function SchemaEditorContent() {
  const { state: graphState } = useGraphContext()
  const graphId = graphState.currentGraphId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Schema data
  const [nodeLabels, setNodeLabels] = useState<NodeLabel[]>([])
  const [relationshipTypes, setRelationshipTypes] = useState<
    RelationshipType[]
  >([])
  const [constraints, setConstraints] = useState<SchemaConstraint[]>([])
  const [indexes, setIndexes] = useState<SchemaIndex[]>([])
  const [rawSchema, setRawSchema] = useState('')

  // UI state
  const [activeTab, setActiveTab] = useState('visual')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter items based on search
  const filteredNodeLabels = nodeLabels.filter((node) =>
    node?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredRelationshipTypes = relationshipTypes.filter((rel) =>
    rel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch schema data
  const fetchSchema = async () => {
    if (!graphId) {
      console.warn('No graphId available, skipping schema fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await SDK.getGraphSchema({
        path: { graph_id: graphId },
      })

      if (!response.data) {
        throw new Error('No schema data returned')
      }

      const schemaData: any = response.data

      // The API returns data in format: { graph_id: string, schema: { node_labels: [], relationship_types: [], node_properties: {} } }
      const schemaContent = schemaData?.schema || schemaData
      const labelNames = schemaContent?.node_labels || []
      const relationshipNames = schemaContent?.relationship_types || []
      const nodeProperties = schemaContent?.node_properties || {}

      // Convert simple string labels to objects with properties
      const labels = labelNames.map((name: string) => ({
        name,
        properties: nodeProperties[name]
          ? nodeProperties[name].map((propName: string) => ({
              name: propName,
              type: 'string', // Default type since API doesn't provide types
              required: false,
              indexed: false,
              unique: false,
            }))
          : [],
        count: undefined,
      }))

      // Convert simple string relationships to objects
      const relationships = relationshipNames.map((name: string) => ({
        name,
        properties: [],
        count: undefined,
      }))

      setNodeLabels(labels)
      setRelationshipTypes(relationships)
      setConstraints(schemaContent?.constraints || [])
      setIndexes(schemaContent?.indexes || [])

      // Fetch export schema for the JSON tab (reusable format) and enhance relationships
      try {
        const exportResponse = await SDK.exportGraphSchema({
          path: { graph_id: graphId },
          query: { format: 'json' },
        })

        if (exportResponse.data?.schema_definition) {
          const exportSchema: any = exportResponse.data.schema_definition
          setRawSchema(JSON.stringify(exportSchema, null, 2))

          // Enhance relationships with from/to nodes and properties from export schema
          if (
            exportSchema.relationships &&
            Array.isArray(exportSchema.relationships)
          ) {
            const enhancedRelationships = exportSchema.relationships.map(
              (rel: any) => ({
                name: rel.name,
                properties: rel.properties || [],
                count: undefined,
                sourceLabels: rel.from_node ? [rel.from_node] : [],
                targetLabels: rel.to_node ? [rel.to_node] : [],
              })
            )
            setRelationshipTypes(enhancedRelationships)
          }
        } else {
          // Fallback to introspection format
          const rawSchemaData = {
            node_labels: labels,
            relationship_types: relationships,
            constraints: schemaContent?.constraints || [],
            indexes: schemaContent?.indexes || [],
            node_properties: schemaContent?.node_properties || {},
          }
          setRawSchema(JSON.stringify(rawSchemaData, null, 2))
        }
      } catch (exportErr) {
        console.warn(
          'Failed to fetch export schema, using introspection:',
          exportErr
        )
        // Fallback to introspection format
        const rawSchemaData = {
          node_labels: labels,
          relationship_types: relationships,
          constraints: schemaContent?.constraints || [],
          indexes: schemaContent?.indexes || [],
          node_properties: schemaContent?.node_properties || {},
        }
        setRawSchema(JSON.stringify(rawSchemaData, null, 2))
      }
    } catch (err: any) {
      console.error('Failed to fetch schema:', err)
      let errorMessage = 'Failed to load schema'
      if (err?.error?.detail) {
        errorMessage = err.error.detail
      } else if (err?.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId])

  if (!graphId) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Alert color="warning" icon={HiInformationCircle}>
          Please select a graph from the dropdown in the top navigation bar to
          view its schema.
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-4">
            <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiCode className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
              Schema Viewer
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your graph schema
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          color="failure"
          icon={HiInformationCircle}
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Node Labels
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {nodeLabels.length}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Relationships
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {relationshipTypes.length}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Properties
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {nodeLabels.reduce(
                (sum, node) => sum + (node.properties?.length || 0),
                0
              ) +
                relationshipTypes.reduce(
                  (sum, rel) => sum + (rel.properties?.length || 0),
                  0
                )}
            </div>
          </div>
        </Card>

        <Card theme={customTheme.card}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Constraints
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {constraints.length + indexes.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card theme={customTheme.card}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <TextInput
              type="text"
              icon={HiSearch}
              placeholder="Search node labels and relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Schema Viewer Tabs */}
      <Tabs
        aria-label="Schema tabs"
        theme={customTheme.tabs}
        variant="underline"
        onActiveTabChange={(tab: number) =>
          setActiveTab(tab === 0 ? 'visual' : 'raw')
        }
      >
        <Tabs.Item
          active={activeTab === 'visual'}
          title="Viewer"
          icon={HiDatabase}
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {/* Node Labels */}
            <Card theme={customTheme.card}>
              <div className="mb-4">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                  Node Labels
                </h3>
              </div>

              {filteredNodeLabels.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'No matching node labels found'
                    : 'No node labels defined'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredNodeLabels.map((node) => (
                    <div
                      key={node.name}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {node.name}
                          </h4>
                          {node.count !== undefined && (
                            <Badge color="gray" size="sm">
                              {node.count} nodes
                            </Badge>
                          )}
                        </div>
                      </div>

                      {node.properties.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Properties:
                          </p>
                          <div className="space-y-1">
                            {node.properties.map((prop) => (
                              <div
                                key={prop.name}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="font-mono text-gray-900 dark:text-white">
                                  {prop.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  :
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {prop.type}
                                </span>
                                {prop.required && (
                                  <Badge size="xs" color="warning">
                                    Required
                                  </Badge>
                                )}
                                {prop.indexed && (
                                  <Badge size="xs" color="info">
                                    Indexed
                                  </Badge>
                                )}
                                {prop.unique && (
                                  <Badge size="xs" color="purple">
                                    Unique
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Relationship Types */}
            <Card theme={customTheme.card}>
              <div className="mb-4">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                  Relationship Types
                </h3>
              </div>

              {filteredRelationshipTypes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'No matching relationship types found'
                    : 'No relationship types defined'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredRelationshipTypes.map((rel) => (
                    <div
                      key={rel.name}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {rel.name}
                          </h4>
                          {rel.count !== undefined && (
                            <Badge color="gray" size="sm">
                              {rel.count} relationships
                            </Badge>
                          )}
                        </div>

                        {(rel.sourceLabels || rel.targetLabels) && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            {rel.sourceLabels &&
                              rel.sourceLabels.length > 0 && (
                                <>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    From:
                                  </span>
                                  <Badge color="blue" size="sm">
                                    {rel.sourceLabels.join(', ')}
                                  </Badge>
                                </>
                              )}
                            <span className="text-gray-400">→</span>
                            {rel.targetLabels &&
                              rel.targetLabels.length > 0 && (
                                <>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    To:
                                  </span>
                                  <Badge color="purple" size="sm">
                                    {rel.targetLabels.join(', ')}
                                  </Badge>
                                </>
                              )}
                          </div>
                        )}
                      </div>

                      {rel.properties.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Properties:
                          </p>
                          <div className="space-y-1">
                            {rel.properties.map((prop) => (
                              <div
                                key={prop.name}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="font-mono text-gray-900 dark:text-white">
                                  {prop.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  :
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {prop.type}
                                </span>
                                {prop.required && (
                                  <Badge size="xs" color="warning">
                                    Required
                                  </Badge>
                                )}
                                {prop.indexed && (
                                  <Badge size="xs" color="info">
                                    Indexed
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Constraints */}
            {constraints.length > 0 && (
              <Card theme={customTheme.card}>
                <div className="mb-4">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                    Constraints
                  </h3>
                </div>
                <div className="space-y-3">
                  {constraints.map((constraint) => (
                    <div
                      key={constraint.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {constraint.type.toUpperCase()} on{' '}
                            {constraint.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Properties: {constraint.properties.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Indexes */}
            {indexes.length > 0 && (
              <Card theme={customTheme.card}>
                <div className="mb-4">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                    Indexes
                  </h3>
                </div>
                <div className="space-y-3">
                  {indexes.map((index) => (
                    <div
                      key={index.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {index.type.toUpperCase()} on {index.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Properties: {index.properties.join(', ')}
                          </p>
                        </div>
                        <Badge
                          color={
                            index.state === 'online'
                              ? 'success'
                              : index.state === 'building'
                                ? 'warning'
                                : 'failure'
                          }
                        >
                          {index.state}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === 'raw'}
          title="Export Schema"
          icon={HiDocumentAdd}
        >
          <Card theme={customTheme.card}>
            <div className="mb-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                Export Schema
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Complete schema definition in reusable JSON format - can be used
                to create a new graph
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <Editor
                height="600px"
                defaultLanguage="json"
                value={rawSchema || '{}'}
                theme="robosystems"
                beforeMount={async (monaco) => {
                  const { robosystemsTheme } =
                    await import('@/lib/monaco-theme')
                  monaco.editor.defineTheme('robosystems', robosystemsTheme)
                  monaco.editor.setTheme('robosystems')
                }}
                options={{
                  readOnly: true,
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
                  smoothScrolling: true,
                  fontLigatures: true,
                }}
              />
            </div>
          </Card>
        </Tabs.Item>
      </Tabs>
    </div>
  )
}
