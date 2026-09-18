import { ApiShell } from '@/components/docs/api/ApiShell'
import { MethodBadge } from '@/components/docs/api/MethodBadge'
import { DocsMarkdown } from '@/components/docs/DocsMarkdown'
import { PROSE } from '@/components/docs/prose'
import {
  API_BASE_PATH,
  deferWhenSpecUrlIsAPlaceholder,
  requireApiCatalog,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

// The reference's front door: how to call the API at all, then every tag with its
// operations. The overview prose is the spec's own `info.description`, so it is the same
// text the SDK generators and the development Swagger page carry.

// Next only reads a literal here, so this cannot be API_REVALIDATE_SECONDS; the two
// are the same hour and are asserted equal in the openapi tests.
export const revalidate = 3600

const TITLE = 'REST API reference | RoboSystems'
const DESCRIPTION =
  'Every REST endpoint of the RoboSystems API, with its parameters, request and response schemas, and an example call: graphs, Cypher queries, SEC filings, accounting operations, billing and access.'

export const metadata: Metadata = publicPageMetadata({
  path: API_BASE_PATH,
  title: TITLE,
  description: DESCRIPTION,
})

export default async function ApiReferencePage() {
  await deferWhenSpecUrlIsAPlaceholder()
  const catalog = await requireApiCatalog()

  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'API reference', path: API_BASE_PATH },
  ]

  return (
    <ApiShell catalog={catalog} crumbs={crumbs}>
      <header className="mb-10 border-b border-gray-800 pb-8">
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
          REST API reference
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          {catalog.operations.length} operations across {catalog.tags.length}{' '}
          groups. Every call goes to{' '}
          <code className="font-mono text-cyan-300">{catalog.serverUrl}</code>{' '}
          and authenticates with an API key from your account settings.
        </p>
        {catalog.version && (
          <p className="mt-3 text-sm text-gray-500">
            Generated from the OpenAPI specification the API is serving, version{' '}
            {catalog.version}.
          </p>
        )}
      </header>

      {catalog.overview && (
        <div className={PROSE}>
          <DocsMarkdown>{catalog.overview}</DocsMarkdown>
        </div>
      )}

      <section className="mt-16 scroll-mt-28" id="operations">
        <h2 className="font-heading mb-8 text-2xl font-bold text-white">
          Operations by group
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {catalog.tags.map((tag) => (
            <div
              key={tag.slug}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
            >
              <h3 className="mb-2 text-lg font-bold text-white">
                <Link href={tag.path} className="hover:text-cyan-400">
                  {tag.title}
                </Link>
              </h3>
              {tag.description && (
                <p className="mb-4 text-sm text-gray-400">{tag.description}</p>
              )}
              <ul className="space-y-1.5">
                {tag.operations.map((operation) => (
                  <li key={operation.slug}>
                    <Link
                      href={operation.path}
                      className="flex items-start gap-2 text-sm text-gray-300 transition-colors hover:text-cyan-400"
                    >
                      <MethodBadge
                        method={operation.method}
                        className="mt-0.5"
                      />
                      <span>{operation.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </ApiShell>
  )
}
