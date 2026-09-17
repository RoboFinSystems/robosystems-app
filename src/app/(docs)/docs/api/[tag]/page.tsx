import { ApiShell } from '@/components/docs/api/ApiShell'
import { MethodBadge } from '@/components/docs/api/MethodBadge'
import { DocsJsonLd } from '@/components/docs/DocsJsonLd'
import {
  API_BASE_PATH,
  findApiTag,
  getApiCatalog,
  requireApiCatalog,
  summarize,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// One page per tag: the group's operations with the route each one answers on. It is the
// page a reader lands on from a query like "robosystems graph operations api", and the hub
// a crawler follows to reach the operation pages.

// Next only reads a literal here, so this cannot be API_REVALIDATE_SECONDS; the two
// are the same hour and are asserted equal in the openapi tests.
export const revalidate = 3600
export const dynamicParams = true

type Props = { params: Promise<{ tag: string }> }

export async function generateStaticParams() {
  const catalog = await getApiCatalog()
  return (catalog?.tags ?? []).map((tag) => ({ tag: tag.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const catalog = await getApiCatalog()
  const tag = catalog && findApiTag(catalog, (await params).tag)
  if (!tag) return { title: 'Page Not Found | RoboSystems API' }
  return publicPageMetadata({
    path: tag.path,
    title: `${tag.title} API | RoboSystems`,
    description:
      tag.description ||
      `The ${tag.title} operations of the RoboSystems REST API.`,
  })
}

export default async function ApiTagPage({ params }: Props) {
  const catalog = await requireApiCatalog()
  const tag = findApiTag(catalog, (await params).tag)
  if (!tag) notFound()

  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'API reference', path: API_BASE_PATH },
    { name: tag.title, path: tag.path },
  ]

  return (
    <ApiShell catalog={catalog} crumbs={crumbs} activeTag={tag.slug}>
      <DocsJsonLd
        page={{
          title: `${tag.title} API`,
          description: tag.description,
          path: tag.path,
          updated: null,
        }}
        crumbs={crumbs}
      />

      <header className="mb-10 border-b border-gray-800 pb-8">
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
          {tag.title}
        </h1>
        {tag.description && (
          <p className="mt-4 text-lg text-gray-400">{tag.description}</p>
        )}
        <p className="mt-3 text-sm text-gray-500">
          {tag.operations.length}{' '}
          {tag.operations.length === 1 ? 'operation' : 'operations'}.
        </p>
      </header>

      <ul className="space-y-4">
        {tag.operations.map((operation) => (
          <li key={operation.slug}>
            <Link
              href={operation.path}
              className="block rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-cyan-500/50"
            >
              <div className="flex flex-wrap items-center gap-3">
                <MethodBadge method={operation.method} />
                <code className="font-mono text-sm break-all text-gray-300">
                  {operation.route}
                </code>
              </div>
              <h2 className="mt-3 font-semibold text-white">
                {operation.summary}
              </h2>
              {operation.description && (
                <p className="mt-1 text-sm text-gray-400">
                  {summarize(operation.description, 180)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </ApiShell>
  )
}
