/**
 * The schema a generic graph starts from. A graph cannot be provisioned without at
 * least one node table, so the form opens on a small one that provisions as it stands:
 * enough for a parent graph whose work happens in its subgraphs, and a shape to edit
 * for one that holds data itself.
 */
export const STARTER_SCHEMA = {
  name: 'starter_graph',
  version: '1.0.0',
  description: 'Items grouped into categories',
  nodes: [
    {
      name: 'Item',
      properties: [
        { name: 'identifier', type: 'STRING', is_primary_key: true },
        { name: 'name', type: 'STRING', nullable: false },
      ],
    },
    {
      name: 'Category',
      properties: [
        { name: 'identifier', type: 'STRING', is_primary_key: true },
        { name: 'name', type: 'STRING', nullable: false },
      ],
    },
  ],
  relationships: [
    {
      name: 'BELONGS_TO',
      from_node: 'Item',
      to_node: 'Category',
      properties: [],
    },
  ],
}

export const STARTER_SCHEMA_JSON = JSON.stringify(STARTER_SCHEMA, null, 2)

/** A problem with the schema the user entered, caught before any request is sent. */
export class SchemaInputError extends Error {}

/** Parse the schema text of a generic graph, refusing what the API cannot provision. */
export function parseGraphSchema(text: string): Record<string, unknown> {
  const raw = text.trim()
  if (!raw) {
    throw new SchemaInputError(
      'A graph needs a schema. Reset to the starter schema or paste your own.'
    )
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new SchemaInputError('The schema is not valid JSON.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new SchemaInputError('The schema must be a JSON object.')
  }
  const { nodes } = parsed as { nodes?: unknown }
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new SchemaInputError('The schema must define at least one node.')
  }
  return parsed as Record<string, unknown>
}
