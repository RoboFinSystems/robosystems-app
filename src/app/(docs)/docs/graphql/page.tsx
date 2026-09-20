import { CodeBlock } from '@/components/docs/api/CodeBlock'
import { PROSE } from '@/components/docs/prose'
import {
  GRAPHQL_BASE_PATH,
  GRAPHQL_ENDPOINT_PATH,
  deferWhenGraphqlUrlIsAPlaceholder,
  requireGraphqlCatalog,
  typeLabel,
} from '@/lib/graphql'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

// The GraphQL reference's front door: what the surface is, how to call it, and every
// field the API is actually serving, grouped and one-line described. Rendered from live
// introspection, so a deployment without RoboInvestor documents no investor fields.

// Next only reads a literal here; it matches GRAPHQL_REVALIDATE_SECONDS.
export const revalidate = 3600
export const dynamicParams = true

const TITLE = 'GraphQL reference | RoboSystems'
const DESCRIPTION =
  'Every query the extensions GraphQL surface serves: ledger, investor, block and taxonomy-library reads, with arguments, return types and an example call.'

export const metadata: Metadata = publicPageMetadata({
  path: GRAPHQL_BASE_PATH,
  title: TITLE,
  description: DESCRIPTION,
})

export default async function GraphqlReferencePage() {
  await deferWhenGraphqlUrlIsAPlaceholder()
  const catalog = await requireGraphqlCatalog()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-cyan-400">
          Docs
        </Link>
        <span className="px-2">/</span>
        <span className="text-gray-300">GraphQL</span>
      </nav>

      <h1 className="font-heading text-4xl text-white">GraphQL reference</h1>
      <div className={`${PROSE} mt-6`}>
        <p>
          The typed read surface for a graph&apos;s extensions data — RoboLedger
          and RoboInvestor records as they stand right now. Writes are not here:
          those are the named operations under{' '}
          <code>
            /extensions/{'{domain}'}/{'{graph_id}'}/operations/
          </code>
          , in the <Link href="/docs/api">REST reference</Link>.
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

      <div className="mt-10 space-y-10">
        {catalog.domains.map((domain) => (
          <section key={domain.slug} id={domain.slug}>
            <h2 className="font-heading text-2xl text-white">{domain.title}</h2>
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
    </div>
  )
}

/** The summary line of a description; the field's own page carries the rest. */
function firstLine(description: string): string {
  return description.split('\n\n')[0]?.replace(/\s+/g, ' ').trim() ?? ''
}
