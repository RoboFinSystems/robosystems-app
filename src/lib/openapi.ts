// The REST API reference, read from the live OpenAPI spec.
//
// The pages are rendered on the server from `api.robosystems.ai/openapi.json` so a crawler
// gets an operation's parameters, schemas and an example call as HTML. The old Swagger and
// ReDoc pages on the API host were client-rendered shells over a ~950 KB JSON file, which
// is why all three API-host URLs sat crawled-not-indexed.
//
// The API and this app deploy separately and by hand, so the reference follows the spec
// rather than a build artifact: `generateStaticParams` pre-renders every page the spec has
// at build time, `dynamicParams` renders one added later on first request, and the fetch
// revalidates hourly. Nothing needs a cross-repo deploy trigger.

import { cache } from 'react'

export const OPENAPI_URL =
  process.env.NEXT_PUBLIC_OPENAPI_URL ||
  'https://api.robosystems.ai/openapi.json'

/** The API host, for the example calls. Never used to fetch. */
export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.robosystems.ai'

export const API_REVALIDATE_SECONDS = 3600

export const API_BASE_PATH = '/docs/api'

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

/**
 * The subset of JSON Schema the spec actually uses. FastAPI emits `anyOf` for optional
 * fields and nothing else of the composition keywords — a census of all 466 component
 * schemas found no `allOf` and no `oneOf` — so the renderer handles `anyOf` only and
 * would show an unhandled keyword as a bare type rather than silently wrong text.
 */
export interface SchemaObject {
  $ref?: string
  type?: string | string[]
  format?: string
  title?: string
  description?: string
  properties?: Record<string, SchemaObject>
  required?: string[]
  items?: SchemaObject
  anyOf?: SchemaObject[]
  enum?: unknown[]
  default?: unknown
  examples?: unknown[]
  example?: unknown
  additionalProperties?: boolean | SchemaObject
  minLength?: number
  maxLength?: number
  minItems?: number
  const?: unknown
}

export interface ApiParameter {
  name: string
  location: string
  required: boolean
  description: string
  schema: SchemaObject
}

export interface ApiBody {
  required: boolean
  contentType: string
  schema?: SchemaObject
}

export interface ApiResponse {
  status: string
  description: string
  schema?: SchemaObject
}

export interface ApiSecurityScheme {
  /** The header the caller sends, e.g. `X-API-Key` or `Authorization`. */
  header: string
  /** What to put in it, with a placeholder rather than a credential. */
  value: string
  label: string
}

export interface ApiOperation {
  id: string
  slug: string
  path: string
  method: HttpMethod
  route: string
  summary: string
  description: string
  deprecated: boolean
  tagName: string
  tagSlug: string
  tagTitle: string
  parameters: ApiParameter[]
  body?: ApiBody
  responses: ApiResponse[]
  security: ApiSecurityScheme[]
}

export interface ApiTag {
  name: string
  slug: string
  path: string
  title: string
  description: string
  operations: ApiOperation[]
}

export interface ApiCatalog {
  title: string
  version: string
  overview: string
  serverUrl: string
  tags: ApiTag[]
  operations: ApiOperation[]
  schemas: Record<string, SchemaObject>
}

export interface OpenApiDocument {
  info?: { title?: string; version?: string; description?: string }
  tags?: { name?: string; description?: string }[]
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, SchemaObject>
    securitySchemes?: Record<string, Record<string, unknown>>
  }
}

/** `Extensions: RoboLedger` → `extensions-roboledger`. */
export function tagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** `getCurrentAuthUser` → `get-current-auth-user`. Every operationId in the spec is unique. */
export function operationSlug(operationId: string): string {
  return operationId
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Tag descriptions in the spec read `"🏗️ Graphs - Create and manage …"`: a leading emoji,
 * a display label, then the sentence. The tag's own name is the canonical title, so only
 * the sentence is kept — the label is often a near-duplicate of the name.
 */
function tagDescription(raw: string): string {
  const text = raw.replace(/^[^\p{L}\p{N}]+/u, '').trim()
  const split = /\s+[-—–]\s+/.exec(text)
  return split ? text.slice(split.index + split[0].length).trim() : text
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function schemaOf(content: unknown): SchemaObject | undefined {
  if (!content || typeof content !== 'object') return undefined
  const entry = (content as Record<string, { schema?: SchemaObject }>)[
    'application/json'
  ]
  return entry?.schema
}

function contentTypeOf(content: unknown): string {
  if (!content || typeof content !== 'object') return 'application/json'
  const keys = Object.keys(content as Record<string, unknown>)
  return keys.includes('application/json')
    ? 'application/json'
    : (keys[0] ?? 'application/json')
}

/**
 * What a caller has to send to authenticate, read from the spec's security schemes rather
 * than assumed: an `apiKey` scheme names its own header, and `http`/`bearer` is the
 * Authorization header. Values are placeholders — the reference never takes a credential.
 */
function securityFor(
  operation: Record<string, unknown>,
  schemes: Record<string, Record<string, unknown>>
): ApiSecurityScheme[] {
  const requirements = operation.security
  if (!Array.isArray(requirements)) return []
  const out: ApiSecurityScheme[] = []
  for (const requirement of requirements) {
    for (const name of Object.keys(
      (requirement ?? {}) as Record<string, unknown>
    )) {
      const scheme = schemes[name]
      if (!scheme) continue
      if (scheme.type === 'apiKey' && scheme.in === 'header') {
        const header = asString(scheme.name) || 'X-API-Key'
        out.push({
          header,
          value: '$ROBOSYSTEMS_API_KEY',
          label: 'API key',
        })
      } else if (scheme.type === 'http' && scheme.scheme === 'bearer') {
        out.push({
          header: 'Authorization',
          value: 'Bearer $ACCESS_TOKEN',
          label: 'Bearer token',
        })
      }
    }
  }
  return out.filter(
    (scheme, i) => out.findIndex((s) => s.header === scheme.header) === i
  )
}

/** The catalog a spec document produces. Exported so it can be tested without a fetch. */
export function buildCatalog(doc: OpenApiDocument): ApiCatalog {
  const schemes = doc.components?.securitySchemes ?? {}
  const declared = doc.tags ?? []
  const titles = new Map<string, { title: string; description: string }>()
  for (const tag of declared) {
    if (!tag.name) continue
    titles.set(tag.name, {
      title: tag.name,
      description: tagDescription(tag.description ?? ''),
    })
  }

  const operations: ApiOperation[] = []
  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    const shared = Array.isArray(item.parameters)
      ? (item.parameters as Record<string, unknown>[])
      : []
    for (const method of HTTP_METHODS) {
      const raw = item[method]
      if (!raw || typeof raw !== 'object') continue
      const operation = raw as Record<string, unknown>
      const operationId = asString(operation.operationId)
      if (!operationId) continue
      const tags = Array.isArray(operation.tags)
        ? (operation.tags as string[])
        : []
      const tagName = tags[0] ?? 'Other'
      const slug = operationSlug(operationId)
      const tSlug = tagSlug(tagName)

      const parameters: ApiParameter[] = [
        ...shared,
        ...(Array.isArray(operation.parameters)
          ? (operation.parameters as Record<string, unknown>[])
          : []),
      ].map((p) => ({
        name: asString(p.name),
        location: asString(p.in),
        required: p.required === true,
        description: asString(p.description),
        schema: (p.schema ?? {}) as SchemaObject,
      }))

      const rawBody = operation.requestBody as
        { required?: boolean; content?: unknown } | undefined
      const body: ApiBody | undefined = rawBody
        ? {
            required: rawBody.required === true,
            contentType: contentTypeOf(rawBody.content),
            schema: schemaOf(rawBody.content),
          }
        : undefined

      const responses: ApiResponse[] = Object.entries(
        (operation.responses ?? {}) as Record<
          string,
          { description?: string; content?: unknown }
        >
      )
        .map(([status, response]) => ({
          status,
          description: asString(response?.description),
          schema: schemaOf(response?.content),
        }))
        .sort((a, b) => a.status.localeCompare(b.status))

      operations.push({
        id: operationId,
        slug,
        path: `${API_BASE_PATH}/${tSlug}/${slug}`,
        method,
        route,
        summary: asString(operation.summary) || operationId,
        description: asString(operation.description),
        deprecated: operation.deprecated === true,
        tagName,
        tagSlug: tSlug,
        tagTitle: titles.get(tagName)?.title ?? tagName,
        parameters,
        body,
        responses,
        security: securityFor(operation, schemes),
      })
    }
  }

  // Tag order follows the spec's own `tags` list — it is the order the API author chose,
  // and it groups related surfaces. A tag that appears only on an operation is appended.
  const names = [
    ...declared.map((t) => t.name).filter((n): n is string => !!n),
    ...operations.map((o) => o.tagName),
  ]
  const tags: ApiTag[] = []
  for (const name of names) {
    if (tags.some((t) => t.name === name)) continue
    const ops = operations.filter((o) => o.tagName === name)
    if (ops.length === 0) continue
    const slug = tagSlug(name)
    tags.push({
      name,
      slug,
      path: `${API_BASE_PATH}/${slug}`,
      title: titles.get(name)?.title ?? name,
      description: titles.get(name)?.description ?? '',
      operations: ops,
    })
  }

  return {
    title: doc.info?.title ?? 'RoboSystems API',
    version: doc.info?.version ?? '',
    overview: doc.info?.description ?? '',
    serverUrl: API_SERVER_URL,
    tags,
    operations,
    schemas: doc.components?.schemas ?? {},
  }
}

/**
 * The catalog, memoized for the render pass. Next's fetch cache holds the spec itself, so
 * this only avoids re-parsing it per page; deliberately not cached across requests, since
 * an in-process cache in front of a revalidating fetch is what makes a newly added page
 * 404 long after the spec has it.
 */
export const getApiCatalog = cache(async (): Promise<ApiCatalog | null> => {
  try {
    const res = await fetch(OPENAPI_URL, {
      next: { revalidate: API_REVALIDATE_SECONDS },
    })
    if (!res.ok) throw new Error(`OpenAPI fetch failed: ${res.status}`)
    return buildCatalog((await res.json()) as OpenApiDocument)
  } catch (error) {
    console.error('Error loading the OpenAPI spec:', error)
    return null
  }
})

export function findApiTag(
  catalog: ApiCatalog,
  slug: string
): ApiTag | undefined {
  return catalog.tags.find((t) => t.slug === slug)
}

export function findApiOperation(
  catalog: ApiCatalog,
  tag: string,
  operation: string
): ApiOperation | undefined {
  return catalog.operations.find(
    (o) => o.tagSlug === tag && o.slug === operation
  )
}

/** The operations before and after one, within its tag. */
export function apiNeighbors(
  tag: ApiTag,
  slug: string
): { previous?: ApiOperation; next?: ApiOperation } {
  const i = tag.operations.findIndex((o) => o.slug === slug)
  if (i === -1) return {}
  return { previous: tag.operations[i - 1], next: tag.operations[i + 1] }
}

/**
 * A one-line description for `<meta>`: the first sentence of an operation's markdown with
 * its formatting removed, capped at about what a search result shows. Operation prose is
 * written for the reference page, so the opening sentence is the one worth showing.
 */
export function summarize(markdown: string, max = 155): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return ''
  const sentence = /[.!?](\s|$)/.exec(plain)
  const first = sentence ? plain.slice(0, sentence.index + 1) : plain
  if (first.length <= max) return first
  const cut = first.lastIndexOf(' ', max - 1)
  return `${first.slice(0, cut > 0 ? cut : max - 1).trimEnd()}…`
}
