import { ApiShell } from '@/components/docs/api/ApiShell'
import { CodeBlock } from '@/components/docs/api/CodeBlock'
import { PROSE } from '@/components/docs/prose'
import {
  GRAPHQL_BASE_PATH,
  GRAPHQL_ENDPOINT_PATH,
  deferWhenGraphqlUrlIsAPlaceholder,
  requireGraphqlCatalog,
  typeLabel,
} from '@/lib/graphql'
import {
  EXTENSIONS_BASE_PATH,
  catalogForSurface,
  deferWhenSpecUrlIsAPlaceholder,
  requireApiCatalog,
  type ApiCatalog,
  type ApiOperation,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

// The GraphQL reference's front door: what the surface is, how to call it, and every
// field the API is actually serving, grouped and one-line described. Rendered from live
// introspection, so a deployment without RoboInvestor documents no investor fields.

// Next only reads a literal here; it matches GRAPHQL_REVALIDATE_SECONDS.
export const revalidate = 3600
export const dynamicParams = true

const TITLE = 'GraphQL: the extensions read surface | RoboSystems'
const DESCRIPTION =
  'The read-only half of the RoboSystems extensions surface: every ledger, investor, block and taxonomy-library query, with its arguments, return type and an example call.'

export const metadata: Metadata = publicPageMetadata({
  path: GRAPHQL_BASE_PATH,
  title: TITLE,
  description: DESCRIPTION,
})

/**
 * The catalog the nav renders from, with GraphQL shown as a leaf.
 *
 * Its two HTTP operations are documented on this page rather than as pages of their
 * own, so expanding them in the sidebar would offer links that resolve to nothing.
 */
function navCatalog(catalog: ApiCatalog): ApiCatalog {
  return {
    ...catalog,
    tags: catalog.tags.map((tag) =>
      tag.slug === 'graphql' ? { ...tag, operations: [] } : tag
    ),
  }
}

export default async function GraphqlReferencePage() {
  await deferWhenGraphqlUrlIsAPlaceholder()
  await deferWhenSpecUrlIsAPlaceholder()
  const catalog = await requireGraphqlCatalog()
  const spec = catalogForSurface(await requireApiCatalog(), 'extensions')
  const endpoint = spec.operations.filter((o) => o.tagSlug === 'graphql')

  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'Extensions', path: EXTENSIONS_BASE_PATH },
    { name: 'GraphQL', path: GRAPHQL_BASE_PATH },
  ]

  return (
    <ApiShell
      catalog={navCatalog(spec)}
      crumbs={crumbs}
      activeTag="graphql"
      basePath={EXTENSIONS_BASE_PATH}
      overviewLabel="Extensions"
    >
      <h1 className="font-heading text-4xl text-white">
        GraphQL: the read surface
      </h1>
      <div className={`${PROSE} mt-6`}>
        <p>
          <strong>This surface is read-only.</strong> It answers questions about
          a graph&apos;s extensions data — RoboLedger and RoboInvestor records
          as they stand right now — and changes nothing. Every write is a{' '}
          <Link href={EXTENSIONS_BASE_PATH}>named operation</Link> instead, so a
          query can never have a side effect and an operation is never a
          surprise.
        </p>
        <p>
          Every query goes to one endpoint, scoped by its URL.{' '}
          <code>graph_id</code> is a path parameter and never a query argument,
          so a document cannot name a graph that disagrees with the path it was
          sent to.
        </p>
      </div>

      <div className="mt-6">
        <CodeBlock label={`POST ${catalog.serverUrl}${GRAPHQL_ENDPOINT_PATH}`}>
          {`curl -X POST "${catalog.serverUrl}/extensions/$GRAPH_ID/graphql" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ entity { id name } }"}'`}
        </CodeBlock>
      </div>

      <div className={`${PROSE} mt-8`}>
        <p>
          The schema is composed per deployment: ledger fields require
          RoboLedger and investor fields require RoboInvestor, and a disabled
          domain is absent from the schema rather than failing at runtime. This
          page is generated from the schema{' '}
          <strong>this deployment is serving</strong>, so what you see below is
          what you can ask for. For the mechanics — auth, pagination limits, the
          error vocabulary and the MCP tools that give an agent the same surface
          — see the{' '}
          <Link href="/docs/technical/graphql-reads">GraphQL Reads guide</Link>.
        </p>
      </div>

      {endpoint.length > 0 && (
        <section className="mt-12" id="endpoint">
          <h2 className="font-heading text-2xl text-white">The endpoint</h2>
          <p className="mt-2 text-gray-400">
            Two HTTP operations serve this surface. Everything below them is a
            query you send to the first one.
          </p>
          <ul className="mt-5 space-y-3">
            {endpoint.map((operation: ApiOperation) => (
              <li
                key={operation.slug}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs tracking-wider text-cyan-400 uppercase">
                    {operation.method}
                  </span>
                  <code className="font-mono text-sm break-all text-gray-300">
                    {operation.route}
                  </code>
                </div>
                <h3 className="mt-3 font-semibold text-white">
                  {operation.summary}
                </h3>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 space-y-10">
        <h2 className="font-heading text-2xl text-white">
          Queries ({catalog.fields.length})
        </h2>
        {catalog.domains.map((domain) => (
          <section key={domain.slug} id={domain.slug}>
            <h3 className="font-heading text-xl text-white">{domain.title}</h3>
            <p className="mt-2 text-gray-400">{domain.description}</p>
            <ul className="mt-5 divide-y divide-gray-800 border-t border-gray-800">
              {domain.fields.map((field) => (
                <li key={field.name} className="py-3">
                  <Link
                    href={`${GRAPHQL_BASE_PATH}/${field.slug}`}
                    className="group flex flex-wrap items-baseline gap-x-3"
                  >
                    <code className="font-mono text-cyan-400 group-hover:text-cyan-300">
                      {field.name}
                    </code>
                    <span className="font-mono text-xs text-gray-600">
                      {typeLabel(field.type)}
                    </span>
                  </Link>
                  {field.description && (
                    <p className="mt-1 text-sm text-gray-400">
                      {firstLine(field.description)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ApiShell>
  )
}

/** The summary line of a description; the field's own page carries the rest. */
function firstLine(description: string): string {
  return description.split('\n\n')[0]?.replace(/\s+/g, ' ').trim() ?? ''
}
