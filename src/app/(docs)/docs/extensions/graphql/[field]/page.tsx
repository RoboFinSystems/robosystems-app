import { ApiShell } from '@/components/docs/api/ApiShell'
import { CodeBlock } from '@/components/docs/api/CodeBlock'
import { DocsMarkdown } from '@/components/docs/DocsMarkdown'
import { PROSE } from '@/components/docs/prose'
import {
  GRAPHQL_BASE_PATH,
  deferWhenGraphqlUrlIsAPlaceholder,
  exampleQuery,
  findGraphqlField,
  getGraphqlCatalog,
  isScalar,
  requireGraphqlCatalog,
  typeLabel,
  type GraphqlCatalog,
  type GraphqlField,
} from '@/lib/graphql'
import {
  EXTENSIONS_BASE_PATH,
  catalogForSurface,
  deferWhenSpecUrlIsAPlaceholder,
  requireApiCatalog,
  summarize,
  type ApiCatalog,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// One page per query field: what it takes, what it returns, and a call you can run.
// Pre-rendered from the schema the API is serving; a field added later renders on first
// request rather than 404ing until the next deploy.

export const revalidate = 3600
export const dynamicParams = true

type Props = { params: Promise<{ field: string }> }

export async function generateStaticParams() {
  const catalog = await getGraphqlCatalog()
  return (catalog?.fields ?? []).map((field) => ({ field: field.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { field: slug } = await params
  const catalog = await getGraphqlCatalog()
  const field = catalog ? findGraphqlField(catalog, slug) : undefined
  if (!field) {
    return publicPageMetadata({
      path: `${GRAPHQL_BASE_PATH}/${slug}`,
      title: 'GraphQL reference | RoboSystems',
      description:
        'Every query the extensions GraphQL surface serves, generated from the live schema.',
    })
  }
  return publicPageMetadata({
    path: `${GRAPHQL_BASE_PATH}/${field.slug}`,
    title: `${field.name} | GraphQL reference | RoboSystems`,
    description:
      summarize(field.description) ||
      `The ${field.name} query on the RoboSystems extensions GraphQL surface.`,
  })
}

/**
 * The catalog the nav renders from, with GraphQL shown as a leaf.
 *
 * Its two HTTP operations are documented on the GraphQL page rather than as pages of
 * their own, so expanding them in the sidebar would offer links that resolve to nothing.
 */
function navCatalog(catalog: ApiCatalog): ApiCatalog {
  return {
    ...catalog,
    tags: catalog.tags.map((tag) =>
      tag.slug === 'graphql' ? { ...tag, operations: [] } : tag
    ),
  }
}

export default async function GraphqlFieldPage({ params }: Props) {
  await deferWhenGraphqlUrlIsAPlaceholder()
  await deferWhenSpecUrlIsAPlaceholder()
  const { field: slug } = await params
  const catalog = await requireGraphqlCatalog()
  const field = findGraphqlField(catalog, slug)
  if (!field) notFound()

  const spec = catalogForSurface(await requireApiCatalog(), 'extensions')
  const returned = catalog.types[field.typeName]
  const domain = catalog.domains.find((d) => d.slug === field.domainSlug)

  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'Extensions', path: EXTENSIONS_BASE_PATH },
    { name: 'GraphQL', path: GRAPHQL_BASE_PATH },
    { name: field.name, path: `${GRAPHQL_BASE_PATH}/${field.slug}` },
  ]

  return (
    <ApiShell
      catalog={navCatalog(spec)}
      crumbs={crumbs}
      activeTag="graphql"
      basePath={EXTENSIONS_BASE_PATH}
      overviewLabel="Extensions"
    >
      <h1 className="font-mono text-3xl text-white">{field.name}</h1>
      <p className="mt-3 font-mono text-sm text-gray-500">
        returns <span className="text-cyan-400">{typeLabel(field.type)}</span>
      </p>

      {field.description && (
        <div className={`${PROSE} mt-6`}>
          <DocsMarkdown>{normalize(field.description)}</DocsMarkdown>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-xl text-white">Arguments</h2>
        {field.args.length === 0 ? (
          <p className="mt-3 text-gray-400">
            None. The graph is chosen by the URL, never by an argument.
          </p>
        ) : (
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {field.args.map((arg) => (
                <tr
                  key={arg.name}
                  className="border-b border-gray-900 align-top"
                >
                  <td className="py-2 pr-4 font-mono text-cyan-400">
                    {arg.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500">
                    {typeLabel(arg.type)}
                    {arg.defaultValue && arg.defaultValue !== 'null' && (
                      <span className="text-gray-600">
                        {' '}
                        = {arg.defaultValue}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-gray-300">
                    {arg.description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {returned && returned.fields.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl text-white">
            Returns{' '}
            <span className="font-mono text-cyan-400">{returned.name}</span>
          </h2>
          {returned.description && (
            <p className="mt-2 text-gray-400">{returned.description}</p>
          )}
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="py-2 pr-4 font-medium">Field</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {returned.fields.map((f) => (
                <tr key={f.name} className="border-b border-gray-900 align-top">
                  <td className="py-2 pr-4 font-mono text-gray-200">
                    {f.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-500">
                    {isScalar(f.typeName) ? (
                      f.typeLabel
                    ) : (
                      <NestedType
                        catalog={catalog}
                        label={f.typeLabel}
                        name={f.typeName}
                      />
                    )}
                  </td>
                  <td className="py-2 text-gray-300">{f.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-xl text-white">Example</h2>
        <div className="mt-4">
          <CodeBlock label="query">{exampleQuery(catalog, field)}</CodeBlock>
        </div>
        <div className="mt-4">
          <CodeBlock label="curl">{curlFor(catalog, field)}</CodeBlock>
        </div>
      </section>

      <Neighbors catalog={catalog} field={field} />
    </ApiShell>
  )
}

/** A nested object type links nowhere yet, but its name is still the thing to introspect. */
function NestedType({
  catalog,
  label,
  name,
}: {
  catalog: GraphqlCatalog
  label: string
  name: string
}) {
  return catalog.types[name] ? (
    <span className="text-gray-400">{label}</span>
  ) : (
    <>{label}</>
  )
}

function Neighbors({
  catalog,
  field,
}: {
  catalog: GraphqlCatalog
  field: GraphqlField
}) {
  const domain = catalog.domains.find((d) => d.slug === field.domainSlug)
  if (!domain) return null
  const i = domain.fields.findIndex((f) => f.slug === field.slug)
  const previous = domain.fields[i - 1]
  const next = domain.fields[i + 1]
  if (!previous && !next) return null
  return (
    <nav className="mt-12 flex justify-between border-t border-gray-800 pt-6 text-sm">
      {previous ? (
        <Link
          href={`${GRAPHQL_BASE_PATH}/${previous.slug}`}
          className="text-gray-400 hover:text-cyan-400"
        >
          ← {previous.name}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={`${GRAPHQL_BASE_PATH}/${next.slug}`}
          className="text-gray-400 hover:text-cyan-400"
        >
          {next.name} →
        </Link>
      )}
    </nav>
  )
}

function curlFor(catalog: GraphqlCatalog, field: GraphqlField): string {
  const query = exampleQuery(catalog, field).replace(/"/g, '\\"')
  return `curl -X POST "${catalog.serverUrl}/extensions/$GRAPH_ID/graphql" \\
  -H "X-API-Key: $ROBOSYSTEMS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "${query}"}'`
}

/**
 * Resolver docstrings are reStructuredText-flavored: ``literal`` is its inline code.
 * Markdown renders that as two empty code spans around the word, so it is converted
 * rather than shown raw.
 */
function normalize(description: string): string {
  return description.replace(/``([^`]+)``/g, '`$1`')
}
