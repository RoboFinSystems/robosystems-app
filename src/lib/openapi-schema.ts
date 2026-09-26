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
  /** The limits a value must meet, e.g. `1–20 characters`, `format ^\d{4}$`. */
  constraints: string[]
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

/** Whether a schema is a union — `anyOf` for FastAPI's optionals, `oneOf` for tagged ones. */
function isUnion(schema: SchemaObject): boolean {
  return !!(schema.anyOf ?? schema.oneOf)
}

/**
 * A union's members that carry a real type. FastAPI writes every optional as
 * `anyOf: [T, {type: 'null'}]`, so a table that printed the union verbatim would say
 * `string | null` on most rows and tell the reader nothing the required column does not
 * already say.
 */
function withoutNull(schema: SchemaObject): SchemaObject[] {
  return (schema.anyOf ?? schema.oneOf ?? []).filter(
    (member) => member.type !== 'null'
  )
}

/** A readable type for a field: `string`, `string (date)`, `Foo`, `Foo[]`, `string | integer`. */
export function typeLabel(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined
): string {
  if (!schema) return 'any'
  const name = refName(schema)
  if (name) return name
  if (isUnion(schema)) {
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
  if (isUnion(schema)) {
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
  if (isUnion(schema)) {
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

function range(
  low: number | undefined,
  high: number | undefined,
  unit: string
): string | null {
  const of = (n: number) => (unit ? ` ${unit}${n === 1 ? '' : 's'}` : '')
  if (low !== undefined && high !== undefined)
    return low === high
      ? `exactly ${low}${of(low)}`
      : `${low}–${high}${of(high)}`
  if (low !== undefined) return `at least ${low}${of(low)}`
  if (high !== undefined) return `at most ${high}${of(high)}`
  return null
}

/**
 * The limits a value is validated against, read off the field itself and, for an
 * optional, its non-null member — FastAPI puts a `Field(max_length=…)` on the member.
 * A request that breaks one is a 422, so the page says them rather than leaving the
 * reader to find each by failing.
 */
export function constraintsOf(schema: SchemaObject): string[] {
  const members = isUnion(schema) ? withoutNull(schema) : []
  const sources = [schema, ...(members.length === 1 ? members : [])]
  const pick = <K extends keyof SchemaObject>(key: K) =>
    sources.map((source) => source[key]).find((value) => value !== undefined)

  const out = [
    // A zero floor on a count says nothing; on a number it means non-negative.
    range(pick('minLength') || undefined, pick('maxLength'), 'character'),
    range(pick('minItems') || undefined, pick('maxItems'), 'item'),
    range(pick('minimum'), pick('maximum'), ''),
  ]
  const exclusiveMin = pick('exclusiveMinimum')
  const exclusiveMax = pick('exclusiveMaximum')
  if (exclusiveMin !== undefined) out.push(`greater than ${exclusiveMin}`)
  if (exclusiveMax !== undefined) out.push(`less than ${exclusiveMax}`)
  const pattern = pick('pattern')
  if (pattern) out.push(`matches ${pattern}`)
  return out.filter((entry): entry is string => !!entry)
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
      constraints: constraintsOf(property),
      nested: expandable ? { name: model, schema: core } : undefined,
    }
  })
}

export interface SchemaVariant {
  /** The discriminator values that select this arm; empty when the union has no tag. */
  values: string[]
  /** The arm's model name, for a union with no tag to label it by. */
  name: string
  description: string
  schema: SchemaObject
}

export interface SchemaUnion {
  /** The property whose value picks the arm, e.g. `block_type`. */
  discriminator: string | null
  variants: SchemaVariant[]
}

function tagValues(property: SchemaObject | undefined): string[] {
  if (!property) return []
  if (property.const !== undefined) return [literal(property.const)]
  return (property.enum ?? []).map(literal)
}

/**
 * A body whose root is a union of object models, read as its arms. Such a body has no
 * properties of its own, so a field table over it is empty — each arm gets its own, headed
 * by the discriminator values that select it.
 */
export function schemaUnion(
  catalog: ApiCatalog,
  schema: SchemaObject | undefined
): SchemaUnion | null {
  const resolved = resolveSchema(catalog, schema)
  if (!resolved || resolved.properties || !isUnion(resolved)) return null
  const tag = resolved.discriminator?.propertyName ?? null
  const mapping = Object.entries(resolved.discriminator?.mapping ?? {})

  const variants = withoutNull(resolved).flatMap((member) => {
    const arm = resolveSchema(catalog, member)
    if (!arm?.properties) return []
    const mapped = member.$ref
      ? mapping.filter(([, ref]) => ref === member.$ref).map(([value]) => value)
      : []
    return [
      {
        values: mapped.length
          ? mapped
          : tag
            ? tagValues(arm.properties[tag])
            : [],
        name: refName(member) ?? arm.title ?? '',
        description: arm.description ?? '',
        schema: arm,
      },
    ]
  })
  return variants.length ? { discriminator: tag, variants } : null
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

  const resolved = resolveSchema(catalog, schema)
  if (!resolved) return null
  if (resolved !== schema && resolved.examples?.length)
    return resolved.examples[0]

  // A tagged union's example is its first arm's — a body the endpoint accepts, where a
  // merge of every arm would be one it rejects.
  if (isUnion(resolved)) {
    const members = withoutNull(resolved)
    return members.length ? exampleValue(catalog, members[0], depth) : null
  }

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
  operation: ApiOperation,
  bodyOverride?: unknown
): string {
  // One way in, not all of them: the alternatives are a choice, and a sample carrying
  // every scheme would read as though each were required. The first is the API key here.
  const credentials = operation.security[0] ?? []

  const query = [
    ...operation.parameters
      .filter((p) => p.location === 'query' && p.required)
      .map((p) => `${p.name}=<${p.name}>`),
    ...credentials
      .filter((scheme) => scheme.location === 'query')
      .map((scheme) => `${scheme.parameter}=${scheme.value}`),
  ].join('&')
  const url = `${catalog.serverUrl}${operation.route}${query ? `?${query}` : ''}`

  const lines = [`curl -X ${operation.method.toUpperCase()} "${url}"`]
  for (const scheme of credentials) {
    if (scheme.location === 'header') {
      lines.push(`  -H "${scheme.parameter}: ${scheme.value}"`)
    } else if (scheme.location === 'cookie') {
      lines.push(`  -H "Cookie: ${scheme.parameter}=${scheme.value}"`)
    }
  }
  for (const parameter of operation.parameters) {
    if (parameter.location !== 'header') continue
    lines.push(`  -H "${parameter.name}: <${parameter.name}>"`)
  }

  const body =
    bodyOverride ??
    (operation.body ? exampleValue(catalog, operation.body.schema) : undefined)
  if (operation.body && hasExampleBody(body)) {
    lines.push(`  -H "Content-Type: ${operation.body.contentType}"`)
    // Single quotes close the shell literal, so any in the payload are re-opened.
    const payload = JSON.stringify(body, null, 2).replace(/'/g, `'\\''`)
    lines.push(`  -d '${payload}'`)
  }

  return lines.join(' \\\n')
}

export interface CurlSample {
  label: string
  command: string
}

interface BodySample {
  label: string
  body: unknown
}

function numbered(label: string, examples: unknown[]): BodySample[] {
  return examples.map((body, i) => ({
    label:
      examples.length > 1
        ? `${label}${label ? ' · ' : ''}example ${i + 1} of ${examples.length}`
        : label,
    body,
  }))
}

/**
 * Every request body the spec writes out for an operation, most specific source first:
 * the OpenAPI named examples, which carry their own summaries; then a tagged union's arms,
 * each by the values that select it; then the model's own `examples` list. Each is a
 * different request, and a page showing only the first leaves the rest unshown. A union
 * arm without an example of its own (the 501 statement arms) gets none — a generated
 * sample of a call that only fails is worse than no sample.
 */
function bodySamples(
  catalog: ApiCatalog,
  operation: ApiOperation
): BodySample[] {
  const body = operation.body
  if (!body) return []
  if (body.examples.length) {
    return body.examples.map((example) => ({
      label: example.label,
      body: example.value,
    }))
  }

  const union = schemaUnion(catalog, body.schema)
  if (union) {
    const samples = union.variants.flatMap((variant) =>
      numbered(
        union.discriminator
          ? `${union.discriminator} = ${variant.values.join(' | ')}`
          : variant.name,
        variant.schema.examples ?? []
      )
    )
    if (samples.length) return samples
  }

  return numbered('', resolveSchema(catalog, body.schema)?.examples ?? [])
}

/** The example calls for a page: one per written-out body, or a single generated one. */
export function curlExamples(
  catalog: ApiCatalog,
  operation: ApiOperation
): CurlSample[] {
  const samples = bodySamples(catalog, operation)
  if (samples.length < 2) {
    return [
      {
        label: 'curl',
        command: curlExample(catalog, operation, samples[0]?.body),
      },
    ]
  }
  return samples.map((sample) => ({
    label: `curl · ${sample.label}`,
    command: curlExample(catalog, operation, sample.body),
  }))
}
