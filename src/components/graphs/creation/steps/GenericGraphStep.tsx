import { Label, Textarea, TextInput } from '@robosystems/core/ui'
import { parseGraphSchema, STARTER_SCHEMA_JSON } from '../schemaTemplate'

interface GenericGraphStepProps {
  graphName: string
  description: string
  tags: string[]
  customSchema: string
  onGraphNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  onTagsChange: (tags: string[]) => void
  onCustomSchemaChange: (schema: string) => void
}

export function GenericGraphStep({
  graphName,
  description,
  tags,
  customSchema,
  onGraphNameChange,
  onDescriptionChange,
  onTagsChange,
  onCustomSchemaChange,
}: GenericGraphStepProps) {
  let schemaError: string | null = null
  try {
    parseGraphSchema(customSchema)
  } catch (error) {
    schemaError = error instanceof Error ? error.message : 'Invalid schema.'
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="graphName">Graph Name</Label>
          <TextInput
            id="graphName"
            type="text"
            placeholder="e.g., Customer Analytics Graph"
            value={graphName}
            onChange={(e) => onGraphNameChange(e.target.value)}
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A descriptive name for your graph database
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe the purpose of this graph database..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (Optional)</Label>
          <TextInput
            id="tags"
            type="text"
            placeholder="e.g., analytics, customers, production"
            value={tags.join(', ')}
            onChange={(e) =>
              onTagsChange(
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t)
              )
            }
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comma-separated tags for organizing your graphs
          </p>
        </div>
      </div>

      {/* Schema */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="customSchema">Schema Definition (JSON)</Label>
          {customSchema !== STARTER_SCHEMA_JSON && (
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => onCustomSchemaChange(STARTER_SCHEMA_JSON)}
            >
              Reset to starter schema
            </button>
          )}
        </div>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Every graph needs at least one node. The starter schema works as it
          stands, which is enough if you plan to work in subgraphs; edit it to
          define your own nodes and relationships.
        </p>
        <Textarea
          id="customSchema"
          value={customSchema}
          onChange={(e) => onCustomSchemaChange(e.target.value)}
          rows={16}
          className="font-mono text-sm"
        />
        {schemaError ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {schemaError}
          </p>
        ) : (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Valid schema
          </p>
        )}
      </div>
    </div>
  )
}
