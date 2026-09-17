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

/**
 * The API this deployment documents, from the same build-time variable every other page
 * uses to reach it. Staging must render staging's spec and print staging's host in the
 * example calls; reading a name nothing sets would have had it document production.
 */
export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'https://api.robosystems.ai'

/** Overridable on its own so a local stack can be rendered without a rebuild. */
export const OPENAPI_URL =
  process.env.NEXT_PUBLIC_OPENAPI_URL || `${API_SERVER_URL}/openapi.json`

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
  /** The scheme's name in the spec, e.g. `APIKeyHeader`. */
  name: string
  /** How it reads on the page: "API key", "Bearer token". */
  label: string
  /** Where the credential goes. `other` is a scheme this renderer cannot sample. */
  location: 'header' | 'query' | 'cookie' | 'other'
  /** The header, query or cookie name. Empty for `other`. */
  parameter: string
  /** What to put there, a placeholder rather than a credential. Empty for `other`. */
  value: string
}

/**
 * One way to authenticate a call: every scheme in it, together.
 *
 * A spec's `security` is a list of requirement objects. Schemes *within* one
 * object are all required; separate objects are alternatives. Flattening the
 * two would render "send any one of these" for a call that needs both, and a
 * sample missing a required header — so the grouping is kept.
 */
export type ApiSecurityOption = ApiSecurityScheme[]

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
  /** Alternative ways to authenticate; each is a set of schemes sent together. */
  security: ApiSecurityOption[]
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
 * One scheme, read from its definition rather than assumed: an `apiKey` scheme names the
 * parameter it uses and where it goes, and `http`/`bearer` is the Authorization header.
 * Anything else is returned as `other` rather than dropped — a page that omitted a scheme
 * it did not recognise would tell the reader the call needs no credential at all.
 */
function describeScheme(
  name: string,
  scheme: Record<string, unknown>
): ApiSecurityScheme {
  if (scheme.type === 'apiKey') {
    const parameter = asString(scheme.name) || 'X-API-Key'
    const location =
      scheme.in === 'query' || scheme.in === 'cookie' ? scheme.in : 'header'
    return {
      name,
      label: 'API key',
      location,
      parameter,
      value: '$ROBOSYSTEMS_API_KEY',
    }
  }
  if (scheme.type === 'http' && scheme.scheme === 'bearer') {
    return {
      name,
      label: 'Bearer token',
      location: 'header',
      parameter: 'Authorization',
      value: 'Bearer $ACCESS_TOKEN',
    }
  }
  return {
    name,
    label: asString(scheme.type) || name,
    location: 'other',
    parameter: '',
    value: '',
  }
}

/** The alternatives an operation accepts, each a set of schemes sent together. */
function securityFor(
  operation: Record<string, unknown>,
  schemes: Record<string, Record<string, unknown>>
): ApiSecurityOption[] {
  const requirements = operation.security
  if (!Array.isArray(requirements)) return []
  return requirements
    .map((requirement) =>
      Object.keys((requirement ?? {}) as Record<string, unknown>)
        .filter((name) => schemes[name])
        .map((name) => describeScheme(name, schemes[name]))
    )
    .filter((option) => option.length > 0)
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

/**
 * The catalog, or an error.
 *
 * A page whose spec could not be fetched is not a missing page, and rendering it as one
 * would have the 404 cached for the revalidation window and, at build time, ship a site
 * with an empty reference and 234 URLs dropped from the sitemap. Failing is louder and
 * recoverable: build again, or let the next request retry.
 */
export async function requireApiCatalog(): Promise<ApiCatalog> {
  const catalog = await getApiCatalog()
  if (!catalog) {
    throw new Error(
      `The OpenAPI specification could not be read from ${OPENAPI_URL}`
    )
  }
  return catalog
}
