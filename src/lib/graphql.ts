// The GraphQL reference, read from the API's own introspection.
//
// The read half of the extensions reference at `/docs/extensions`: writes are the named
// operations, rendered from the OpenAPI spec like any other REST surface, and this is the
// GraphQL side of the same hub. The schema is composed per deployment — ledger fields need RoboLedger,
// investor fields need RoboInvestor — so the only honest source for "what can I ask for"
// is the running API, not a snapshot committed here.
//
// Introspection is deliberately unauthenticated (it is what SDK codegen reads), and the
// `library` sentinel is a graph id that needs no tenant, so the docs build can read the
// schema with no credentials and no graph of its own.

import { connection } from 'next/server'
import { cache } from 'react'
import { API_SERVER_URL } from './openapi'

export const GRAPHQL_BASE_PATH = '/docs/extensions/graphql'

/** The path readers actually call. `graph_id` is theirs; `library` is only ours, for introspection. */
export const GRAPHQL_ENDPOINT_PATH = '/extensions/{graph_id}/graphql'

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_INTROSPECTION_URL ||
  `${API_SERVER_URL}/extensions/library/graphql`

export const GRAPHQL_REVALIDATE_SECONDS = 3600

/** Same placeholder-URL rule as the REST reference: see `specUrlIsResolvable`. */
export function graphqlUrlIsResolvable(): boolean {
  try {
    const { protocol } = new URL(GRAPHQL_URL)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export async function deferWhenGraphqlUrlIsAPlaceholder(): Promise<void> {
  if (!graphqlUrlIsResolvable()) await connection()
}

// ── Introspection shapes ────────────────────────────────────────────────────

export interface TypeRef {
  kind: string
  name: string | null
  ofType?: TypeRef | null
}

export interface GraphqlArgument {
  name: string
  description: string
  type: TypeRef
  defaultValue: string | null
}

export interface GraphqlField {
  name: string
  /** `fiscalCalendar` → `fiscal-calendar`. The URL, and it comes only from the schema. */
  slug: string
  description: string
  args: GraphqlArgument[]
  type: TypeRef
  /** The named type at the bottom of the list/non-null wrappers. */
  typeName: string
  /** Presentation grouping only — never part of a URL. See `DOMAINS`. */
  domainSlug: string
}

export interface GraphqlTypeField {
  name: string
  description: string
  typeLabel: string
  typeName: string
}

export interface GraphqlObjectType {
  name: string
  kind: string
  description: string
  fields: GraphqlTypeField[]
  enumValues: { name: string; description: string }[]
}

export interface GraphqlDomain {
  slug: string
  title: string
  description: string
  fields: GraphqlField[]
}

export interface GraphqlCatalog {
  serverUrl: string
  endpointPath: string
  fields: GraphqlField[]
  domains: GraphqlDomain[]
  types: Record<string, GraphqlObjectType>
}

// ── Domains ─────────────────────────────────────────────────────────────────
//
// GraphQL has no equivalent of an OpenAPI tag, so the grouping cannot be read out of the
// schema. It is declared here, and `graphql.test.ts` asserts every field the schema serves
// is claimed by exactly one domain — so a field added to a resolver fails the build here
// rather than silently disappearing from the reference. Grouping is presentation only:
// a field's URL comes from its name, so a mis-grouped field is still reachable.

interface DomainSpec {
  slug: string
  title: string
  description: string
  /** Matched in order; the first predicate to claim a field wins. */
  claims: (field: string, typeName: string) => boolean
}

const DOMAIN_SPECS: DomainSpec[] = [
  {
    slug: 'ledger',
    title: 'Ledger',
    description:
      'RoboLedger: the entity and its counterparties, the chart of accounts and balances, events and transactions, the fiscal calendar and close, reports and publishing. Requires RoboLedger on the deployment.',
    claims: (f) =>
      [
        'entity',
        'entities',
        'agent',
        'agents',
        'openReceivables',
        'openPayables',
        'openReceivablesByAgent',
        'openPayablesByAgent',
        'eventBlock',
        'eventBlocks',
        'summary',
        'accounts',
        'accountTree',
        'accountRollups',
        'trialBalance',
        'transactions',
        'transaction',
        'journalEntries',
        'taxonomies',
        'reportingTaxonomy',
        'elements',
        'mappingCandidates',
        'unmappedElements',
        'structures',
        'mappings',
        'mapping',
        'mappingCoverage',
        'mappedTrialBalance',
        'periodCloseStatus',
        'chartTemplates',
        'fiscalCalendar',
        'periodDrafts',
        'closingBookStructures',
        'reports',
        'report',
        'reportPackage',
        'reportDownloadUrl',
        'statement',
        'publishLists',
        'publishList',
        'blockedSourceGraphs',
      ].includes(f),
  },
  {
    slug: 'investor',
    title: 'Investor',
    description:
      'RoboInvestor: portfolios, securities, positions and holdings, alongside the ledger on the same graph. Requires RoboInvestor on the deployment.',
    claims: (f) =>
      [
        'portfolios',
        'securities',
        'security',
        'positions',
        'position',
        'holdings',
        'portfolioBlock',
      ].includes(f),
  },
  {
    slug: 'blocks',
    title: 'Information & taxonomy blocks',
    description:
      'The block envelopes both products share: a rendered statement, schedule or rollforward, and the taxonomy blocks behind them. Always present, whichever extensions are enabled.',
    claims: (f) =>
      f.startsWith('informationBlock') || f.startsWith('taxonomyBlock'),
  },
  {
    slug: 'library',
    title: 'Taxonomy library',
    description:
      'The shared public taxonomy library — taxonomies, elements, arcs, structures and traits. Browse it with the `library` graph id, or from a tenant graph to see its own taxonomies with public fallback.',
    claims: (f) => f.startsWith('library') || f === 'searchLibraryElements',
  },
  {
    slug: 'probe',
    title: 'Probe',
    description:
      'The auth probe. Open no session and touch no domain — use it to tell an endpoint that is up from credentials that are not.',
    claims: (f) => f === 'hello',
  },
]

export function domainFor(field: string, typeName: string): string {
  return DOMAIN_SPECS.find((d) => d.claims(field, typeName))?.slug ?? ''
}

export const DOMAIN_ORDER = DOMAIN_SPECS.map((d) => d.slug)

// ── Helpers ─────────────────────────────────────────────────────────────────

/** `fiscalCalendar` → `fiscal-calendar`. Field names are unique on the Query root. */
export function fieldSlug(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** `[Agent!]!`, `String`, `FiscalCalendar` — the GraphQL spelling a reader expects. */
export function typeLabel(ref: TypeRef | null | undefined): string {
  if (!ref) return ''
  if (ref.kind === 'NON_NULL') return `${typeLabel(ref.ofType)}!`
  if (ref.kind === 'LIST') return `[${typeLabel(ref.ofType)}]`
  return ref.name ?? ''
}

/** The named type under the wrappers: `[Agent!]!` → `Agent`. */
export function namedType(ref: TypeRef | null | undefined): string {
  if (!ref) return ''
  if (ref.name) return ref.name
  return namedType(ref.ofType)
}

const SCALARS = new Set([
  'String',
  'Int',
  'Float',
  'Boolean',
  'ID',
  'Date',
  'DateTime',
  'JSON',
  'Decimal',
])

export function isScalar(name: string): boolean {
  return SCALARS.has(name)
}

// ── Catalog ─────────────────────────────────────────────────────────────────

const INTROSPECTION_QUERY = `
query DocsIntrospection {
  __schema {
    queryType {
      fields {
        name
        description
        args { name description defaultValue type { ...Ref } }
        type { ...Ref }
      }
    }
    types {
      kind
      name
      description
      fields(includeDeprecated: false) { name description type { ...Ref } }
      enumValues(includeDeprecated: false) { name description }
    }
  }
}
fragment Ref on __Type {
  kind name
  ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } }
}`

interface IntrospectionResponse {
  data?: {
    __schema?: {
      queryType?: {
        fields?: {
          name: string
          description: string | null
          args?: {
            name: string
            description: string | null
            defaultValue: string | null
            type: TypeRef
          }[]
          type: TypeRef
        }[]
      }
      types?: {
        kind: string
        name: string | null
        description: string | null
        fields?:
          { name: string; description: string | null; type: TypeRef }[] | null
        enumValues?: { name: string; description: string | null }[] | null
      }[]
    }
  }
  errors?: { message: string }[]
}

export function buildGraphqlCatalog(
  response: IntrospectionResponse,
  serverUrl = API_SERVER_URL
): GraphqlCatalog {
  const schema = response.data?.__schema
  const rawFields = schema?.queryType?.fields ?? []

  const types: Record<string, GraphqlObjectType> = {}
  for (const t of schema?.types ?? []) {
    if (!t.name || t.name.startsWith('__')) continue
    types[t.name] = {
      name: t.name,
      kind: t.kind,
      description: t.description ?? '',
      fields: (t.fields ?? []).map((f) => ({
        name: f.name,
        description: f.description ?? '',
        typeLabel: typeLabel(f.type),
        typeName: namedType(f.type),
      })),
      enumValues: (t.enumValues ?? []).map((e) => ({
        name: e.name,
        description: e.description ?? '',
      })),
    }
  }

  const fields: GraphqlField[] = rawFields
    .map((f) => {
      const tn = namedType(f.type)
      return {
        name: f.name,
        slug: fieldSlug(f.name),
        description: f.description ?? '',
        args: (f.args ?? []).map((a) => ({
          name: a.name,
          description: a.description ?? '',
          type: a.type,
          defaultValue: a.defaultValue,
        })),
        type: f.type,
        typeName: tn,
        domainSlug: domainFor(f.name, tn),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const domains: GraphqlDomain[] = DOMAIN_SPECS.map((spec) => ({
    slug: spec.slug,
    title: spec.title,
    description: spec.description,
    fields: fields.filter((f) => f.domainSlug === spec.slug),
  })).filter((d) => d.fields.length > 0)

  // A field no domain claimed is still a field. Surfacing it beats hiding it, and the
  // test turns it into a build failure before it ever renders.
  const orphans = fields.filter((f) => !f.domainSlug)
  if (orphans.length > 0) {
    domains.push({
      slug: 'other',
      title: 'Other',
      description: 'Fields this reference has not grouped yet.',
      fields: orphans,
    })
  }

  return {
    serverUrl,
    endpointPath: GRAPHQL_ENDPOINT_PATH,
    fields,
    domains,
    types,
  }
}

export const getGraphqlCatalog = cache(
  async (): Promise<GraphqlCatalog | null> => {
    if (!graphqlUrlIsResolvable()) return null
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: INTROSPECTION_QUERY }),
        next: { revalidate: GRAPHQL_REVALIDATE_SECONDS },
      })
      if (!res.ok) throw new Error(`Introspection failed: ${res.status}`)
      const body = (await res.json()) as IntrospectionResponse
      if (body.errors?.length) {
        throw new Error(`Introspection errors: ${body.errors[0]?.message}`)
      }
      return buildGraphqlCatalog(body)
    } catch (error) {
      console.error('Error loading the GraphQL schema:', error)
      return null
    }
  }
)

export async function requireGraphqlCatalog(): Promise<GraphqlCatalog> {
  const catalog = await getGraphqlCatalog()
  if (!catalog) {
    throw new Error(`The GraphQL schema could not be read from ${GRAPHQL_URL}`)
  }
  return catalog
}

export function findGraphqlField(
  catalog: GraphqlCatalog,
  slug: string
): GraphqlField | undefined {
  return catalog.fields.find((f) => f.slug === slug)
}

/** The example query a reader can paste, built from the field's own shape. */
export function exampleQuery(
  catalog: GraphqlCatalog,
  field: GraphqlField,
  maxLeaves = 4
): string {
  const required = field.args.filter((a) => typeLabel(a.type).endsWith('!'))
  const argList = required.length
    ? `(${required.map((a) => `${a.name}: ${sampleArg(a)}`).join(', ')})`
    : ''
  const type = catalog.types[field.typeName]
  const leaves = (type?.fields ?? [])
    .filter((f) => isScalar(f.typeName))
    .slice(0, maxLeaves)
    .map((f) => f.name)
  const selection = leaves.length ? ` { ${leaves.join(' ')} }` : ''
  return `{ ${field.name}${argList}${selection} }`
}

function sampleArg(arg: GraphqlArgument): string {
  const t = namedType(arg.type)
  if (t === 'Int' || t === 'Float') return '10'
  if (t === 'Boolean') return 'true'
  if (t === 'Date') return '"2026-01-31"'
  return `"${arg.name === 'id' ? 'rec_...' : '...'}"`
}
