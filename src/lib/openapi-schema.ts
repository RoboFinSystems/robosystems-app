// Reading the spec's schemas into what a reference page shows: a field table, an example
// body, and the curl call. Kept apart from the catalog in `openapi.ts` so the shape of a
// page is separate from the shape of the document.

import type { ApiCatalog, ApiOperation, SchemaObject } from './openapi'

/** How deep a field table expands nested models before naming the type and stopping. */
export const MAX_FIELD_DEPTH = 2

/** How deep a generated example body nests before an object becomes `{}`. */
const MAX_EXAMPLE_DEPTH = 3

export interface SchemaField {
  name: string
  type: string
  required: boolean
  description: string
  enumValues: string[]
  defaultValue: string | null
  /** The model behind this field, when it is worth showing its own table. */
  nested?: { name: string; schema: SchemaObject }
}

/** The component name a `$ref` points at, e.g. `#/components/schemas/Foo` → `Foo`. */
export function refName(schema: SchemaObject | undefined): string | undefined {
  const ref = schema?.$ref
  if (!ref) return undefined
  const name = ref.split('/').pop()
  return name || undefined
}

/** A schema with any `$ref` followed. Component schemas never ref at their own root. */
export function resolveSchema(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined
): SchemaObject | undefined {
  const name = refName(schema)
  if (!name) return schema
  return catalog.schemas[name] ?? schema
}

/**
 * The member of an optional field's union that carries the real type. FastAPI writes every
 * optional as `anyOf: [T, {type: 'null'}]`, so a table that printed the union verbatim
 * would say `string | null` on most rows and tell the reader nothing the required column
 * does not already say.
 */
function withoutNull(schema: SchemaObject): SchemaObject[] {
  return (schema.anyOf ?? []).filter((member) => member.type !== 'null')
}

/** A readable type for a field: `string`, `string (date)`, `Foo`, `Foo[]`, `string | integer`. */
export function typeLabel(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined
): string {
  if (!schema) return 'any'
  const name = refName(schema)
  if (name) return name
  if (schema.anyOf) {
    const members = withoutNull(schema)
    if (members.length === 0) return 'null'
    return members.map((member) => typeLabel(catalog, member)).join(' | ')
  }
  const type = Array.isArray(schema.type)
    ? schema.type.join(' | ')
    : schema.type
  if (type === 'array') return `${typeLabel(catalog, schema.items)}[]`
  if (!type) return schema.enum ? 'enum' : 'any'
  return schema.format ? `${type} (${schema.format})` : type
}

/** The schema behind a field once optionality and array wrapping are peeled off. */
function coreSchema(
  catalog: ApiCatalog,
  schema: SchemaObject
): SchemaObject | undefined {
  if (schema.anyOf) {
    const members = withoutNull(schema)
    return members.length === 1 ? coreSchema(catalog, members[0]) : undefined
  }
  const resolved = resolveSchema(catalog, schema)
  if (!resolved) return undefined
  if (resolved.type === 'array' && resolved.items) {
    return coreSchema(catalog, resolved.items)
  }
  return resolved
}

/** The model name behind a field, for the nested table's heading and the cycle guard. */
function coreName(
  catalog: ApiCatalog,
  schema: SchemaObject
): string | undefined {
  if (schema.anyOf) {
    const members = withoutNull(schema)
    return members.length === 1 ? coreName(catalog, members[0]) : undefined
  }
  const direct = refName(schema)
  if (direct) return direct
  const resolved = resolveSchema(catalog, schema)
  if (resolved?.type === 'array' && resolved.items) {
    return coreName(catalog, resolved.items)
  }
  return undefined
}

function literal(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value) ?? String(value)
}

/** A field's allowed values, following a `$ref` to a named enum where there is one. */
export function enumValuesOf(
  catalog: ApiCatalog,
  schema: SchemaObject
): string[] {
  const direct = schema.enum
  if (direct) return direct.map(literal)
  const core = coreSchema(catalog, schema)
  return (core?.enum ?? []).map(literal)
}

/**
 * The rows of a field table. `seen` carries the model names already open above this table,
 * so a model that contains itself names the type and stops instead of recursing.
 */
export function schemaFields(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined,
  depth = 0,
  seen: string[] = []
): SchemaField[] {
  const resolved = resolveSchema(catalog, schema)
  const object =
    resolved?.type === 'array'
      ? resolveSchema(catalog, resolved.items)
      : resolved
  const properties = object?.properties
  if (!properties) return []
  const required = new Set(object.required ?? [])

  return Object.entries(properties).map(([name, property]) => {
    const core = coreSchema(catalog, property)
    const model = coreName(catalog, property)
    const expandable =
      !!core?.properties &&
      depth < MAX_FIELD_DEPTH &&
      !!model &&
      !seen.includes(model)
    return {
      name,
      type: typeLabel(catalog, property),
      required: required.has(name),
      description: property.description ?? core?.description ?? '',
      enumValues: enumValuesOf(catalog, property),
      defaultValue:
        property.default === undefined ? null : literal(property.default),
      nested: expandable ? { name: model, schema: core } : undefined,
    }
  })
}

function placeholder(schema: SchemaObject, format?: string): unknown {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type
  switch (type) {
    case 'integer':
    case 'number':
      return 0
    case 'boolean':
      return true
    case 'null':
      return null
    default:
      break
  }
  if (format === 'date') return '2026-01-31'
  if (format === 'date-time') return '2026-01-31T00:00:00Z'
  if (format === 'uuid') return '00000000-0000-0000-0000-000000000000'
  if (format === 'email') return 'user@example.com'
  return 'string'
}

/** A minimal, honest example value: the spec's own example or default where it has one. */
export function exampleValue(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined,
  depth = 0
): unknown {
  if (!schema) return null
  if (schema.examples?.length) return schema.examples[0]
  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.const !== undefined) return schema.const
  if (schema.enum?.length) return schema.enum[0]

  if (schema.anyOf) {
    const members = withoutNull(schema)
    return members.length ? exampleValue(catalog, members[0], depth) : null
  }

  const resolved = resolveSchema(catalog, schema)
  if (!resolved) return null
  if (resolved !== schema && resolved.examples?.length)
    return resolved.examples[0]

  if (resolved.type === 'array') {
    return depth >= MAX_EXAMPLE_DEPTH
      ? []
      : [exampleValue(catalog, resolved.items, depth + 1)]
  }

  if (resolved.properties) {
    if (depth >= MAX_EXAMPLE_DEPTH) return {}
    const required = new Set(resolved.required ?? [])
    const entries = Object.entries(resolved.properties).filter(
      ([name]) => required.size === 0 || required.has(name)
    )
    const out: Record<string, unknown> = {}
    for (const [name, property] of entries) {
      out[name] = exampleValue(catalog, property, depth + 1)
    }
    return out
  }

  if (resolved.type === 'object') return {}
  return placeholder(resolved, resolved.format)
}

/** Whether an example body is worth printing at all. */
export function hasExampleBody(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * The example call. Path parameters keep their `{placeholder}` so the reader can see what
 * to substitute, required query parameters are appended, and credentials are shell
 * variables — the reference never takes a key.
 */
export function curlExample(
  catalog: ApiCatalog,
  operation: ApiOperation
): string {
  const query = operation.parameters
    .filter((p) => p.location === 'query' && p.required)
    .map((p) => `${p.name}=<${p.name}>`)
    .join('&')
  const url = `${catalog.serverUrl}${operation.route}${query ? `?${query}` : ''}`

  const lines = [`curl -X ${operation.method.toUpperCase()} "${url}"`]
  // A spec's `security` list is alternatives, not a set to send together: an operation that
  // accepts an API key or a bearer token needs one header, and a sample carrying both would
  // read as though both were required. The first scheme is the API key everywhere here.
  const scheme = operation.security[0]
  if (scheme) lines.push(`  -H "${scheme.header}: ${scheme.value}"`)
  for (const parameter of operation.parameters) {
    if (parameter.location !== 'header') continue
    lines.push(`  -H "${parameter.name}: <${parameter.name}>"`)
  }

  const body = operation.body
    ? exampleValue(catalog, operation.body.schema)
    : undefined
  if (operation.body && hasExampleBody(body)) {
    lines.push(`  -H "Content-Type: ${operation.body.contentType}"`)
    // Single quotes close the shell literal, so any in the payload are re-opened.
    const payload = JSON.stringify(body, null, 2).replace(/'/g, `'\\''`)
    lines.push(`  -d '${payload}'`)
  }

  return lines.join(' \\\n')
}
