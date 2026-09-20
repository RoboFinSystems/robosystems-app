import { ApiShell } from '@/components/docs/api/ApiShell'
import { MethodBadge } from '@/components/docs/api/MethodBadge'
import { PROSE } from '@/components/docs/prose'
import { GRAPHQL_BASE_PATH, getGraphqlCatalog } from '@/lib/graphql'
import {
  EXTENSIONS_BASE_PATH,
  catalogForSurface,
  deferWhenSpecUrlIsAPlaceholder,
  partitionExtensionTags,
  requireApiCatalog,
  summarize,
  type ApiTag,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

// The extensions surface, documented as one thing.
//
// It has three sub-surfaces and they are easy to confuse: typed reads over GraphQL, named
// command writes, and analytical view operations that read the graph rather than the OLTP
// database. Scattered across the REST reference they read as unrelated tags, and each page
// had to re-explain the split badly. Stated once here, the references hang off it.

export const revalidate = 3600
export const dynamicParams = true

const TITLE = 'Extensions | RoboSystems'
const DESCRIPTION =
  'The RoboLedger and RoboInvestor surface: typed GraphQL reads, named command writes, and analytical view operations, with every query and operation documented.'

export const metadata: Metadata = publicPageMetadata({
  path: EXTENSIONS_BASE_PATH,
  title: TITLE,
  description: DESCRIPTION,
})

function TagCard({ tag }: { tag: ApiTag }) {
  return (
    <li>
      <Link
        href={tag.path}
        className="block h-full rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-cyan-500/50"
      >
        <h3 className="font-semibold text-white">{tag.title}</h3>
        {tag.description && (
          <p className="mt-1 text-sm text-gray-400">
            {summarize(tag.description, 120)}
          </p>
        )}
        <p className="mt-3 text-xs text-gray-500">
          {tag.operations.length}{' '}
          {tag.operations.length === 1 ? 'operation' : 'operations'}
        </p>
      </Link>
    </li>
  )
}

export default async function ExtensionsHubPage() {
  await deferWhenSpecUrlIsAPlaceholder()
  const catalog = catalogForSurface(await requireApiCatalog(), 'extensions')
  const graphql = await getGraphqlCatalog()

  // The three sub-surfaces, split in the library so the rule is testable.
  const {
    graphql: graphqlTag,
    writes,
    analytics,
  } = partitionExtensionTags(catalog)
  const writeOps = writes.reduce((n, t) => n + t.operations.length, 0)

  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'Extensions', path: EXTENSIONS_BASE_PATH },
  ]

  return (
    <ApiShell
      catalog={catalog}
      crumbs={crumbs}
      basePath={EXTENSIONS_BASE_PATH}
      overviewLabel="Extensions"
      navLabel="Extensions reference"
    >
      <h1 className="font-heading text-4xl text-white">Extensions</h1>
      <div className={`${PROSE} mt-6`}>
        <p>
          RoboLedger and RoboInvestor: a general ledger and a portfolio, both
          hanging off a graph, both reachable over one HTTP surface. Everything
          here is scoped by <code>graph_id</code> in the URL, and authorization
          is checked before any handler runs.
        </p>
        <p>
          <strong>Reads and writes are deliberately different shapes.</strong> A
          read is a GraphQL query against one endpoint, and it can never change
          anything. A write is a named operation with its own route, request
          model and receipt — there is no general-purpose mutation, so nothing
          changes by accident and every change has a name you can audit. The
          platform API — graphs, billing, auth, connections — is documented
          separately in the <Link href="/docs/api">API reference</Link>.
        </p>
      </div>

      <section className="mt-12" id="reads">
        <h2 className="font-heading text-2xl text-white">Reads</h2>
        <p className="mt-2 text-gray-400">
          One GraphQL endpoint, scoped by the URL. Read-only by construction.
        </p>
        <Link
          href={GRAPHQL_BASE_PATH}
          className="mt-5 block rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-cyan-500/50"
        >
          <div className="flex flex-wrap items-center gap-3">
            <MethodBadge method="post" />
            <code className="font-mono text-sm break-all text-gray-300">
              /extensions/{'{graph_id}'}/graphql
            </code>
          </div>
          <h3 className="mt-3 font-semibold text-white">GraphQL</h3>
          <p className="mt-1 text-sm text-gray-400">
            {graphql
              ? `${graphql.fields.length} queries across ${graphql.domains.length} domains, each with its arguments, return type and an example call.`
              : 'Every query, with its arguments, return type and an example call.'}
          </p>
        </Link>
      </section>

      <section className="mt-12" id="writes">
        <h2 className="font-heading text-2xl text-white">Writes</h2>
        <p className="mt-2 text-gray-400">
          {writeOps} named operations. Each takes a typed request, returns an
          operation envelope, and accepts an{' '}
          <code className="font-mono">Idempotency-Key</code> so a retry is safe.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {writes.map((tag) => (
            <TagCard key={tag.slug} tag={tag} />
          ))}
        </ul>
      </section>

      {analytics.length > 0 && (
        <section className="mt-12" id="analytics">
          <h2 className="font-heading text-2xl text-white">Analytics</h2>
          <p className="mt-2 text-gray-400">
            Read-only operations that query the materialized graph rather than
            the operational database — pivots over the XBRL hypercube, statement
            analysis, and the disclosures a report holds.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {analytics.map((tag) => (
              <TagCard key={tag.slug} tag={tag} />
            ))}
          </ul>
        </section>
      )}

      {graphqlTag && (
        <p className="mt-12 text-sm text-gray-500">
          Working through it by hand? The{' '}
          <Link
            href="/docs/technical/graphql-reads"
            className="text-cyan-400 hover:text-cyan-300"
          >
            GraphQL Reads guide
          </Link>{' '}
          covers auth, pagination limits, the error vocabulary and the MCP tools
          that give an agent the same surface.
        </p>
      )}
    </ApiShell>
  )
}
