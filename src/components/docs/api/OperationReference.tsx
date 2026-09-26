import { ApiShell } from '@/components/docs/api/ApiShell'
import { CodeBlock } from '@/components/docs/api/CodeBlock'
import { MethodBadge } from '@/components/docs/api/MethodBadge'
import { ParameterTable } from '@/components/docs/api/ParameterTable'
import { SchemaFields } from '@/components/docs/api/SchemaFields'
import { DocsJsonLd } from '@/components/docs/DocsJsonLd'
import { DocsMarkdown } from '@/components/docs/DocsMarkdown'
import { InlineMarkdown } from '@/components/docs/InlineMarkdown'
import { PROSE } from '@/components/docs/prose'
import {
  API_BASE_PATH,
  EXTENSIONS_BASE_PATH,
  apiNeighbors,
  catalogForSurface,
  deferWhenSpecUrlIsAPlaceholder,
  findApiOperation,
  findApiTag,
  findMovedApiOperation,
  requireApiCatalog,
  summarize,
  type ApiCatalog,
  type ApiOperation,
  type ApiSecurityOption,
  type ApiSurface,
} from '@/lib/openapi'
import {
  curlExamples,
  exampleValue,
  hasExampleBody,
  schemaFields,
} from '@/lib/openapi-schema'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

// The body of one operation's page: what it takes, what it returns, and a call you can
// run. Shared by the platform reference at /docs/api and the extensions reference at
// /docs/extensions, which differ only in which surface they narrow the catalog to.

/** The meta description: the operation's own prose where it has some, else its call. */
function describe(operation: ApiOperation): string {
  const prose = summarize(operation.description)
  if (prose) return prose
  return `${operation.method.toUpperCase()} ${operation.route} — ${operation.summary} in the RoboSystems API.`
}

/** One way to authenticate: every scheme in it, sent together. */
function SecurityOption({ option }: { option: ApiSecurityOption }) {
  return (
    <>
      {option.map((scheme, i) => (
        <span key={scheme.name}>
          {i > 0 && ', and '}
          {scheme.label}
          {scheme.location === 'other' ? (
            <> ({scheme.name})</>
          ) : (
            <>
              {' '}
              in the{' '}
              <code className="font-mono text-cyan-300">
                {scheme.parameter}
              </code>{' '}
              {scheme.location === 'header' ? 'header' : scheme.location}
            </>
          )}
        </span>
      ))}
      .
    </>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 scroll-mt-28" id={id}>
      <h2 className="font-heading mb-4 text-xl font-bold text-white">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ResponseBody({
  catalog,
  operation,
}: {
  catalog: ApiCatalog
  operation: ApiOperation
}) {
  const success = operation.responses.find((r) => r.status.startsWith('2'))
  const others = operation.responses.filter((r) => r !== success)
  const fields = success ? schemaFields(catalog, success.schema) : []
  const example = success ? exampleValue(catalog, success.schema) : undefined

  return (
    <>
      {success && (
        <div className="space-y-4">
          <p className="text-gray-300">
            <code className="font-mono text-emerald-300">{success.status}</code>{' '}
            {success.description}
          </p>
          {fields.length > 0 ? (
            <SchemaFields catalog={catalog} schema={success.schema} />
          ) : (
            hasExampleBody(example) && (
              <CodeBlock label="Response">
                {JSON.stringify(example, null, 2)}
              </CodeBlock>
            )
          )}
        </div>
      )}
      {others.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-900/70 text-xs tracking-wide text-gray-500 uppercase">
                <th scope="col" className="px-4 py-2 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {others.map((response) => (
                <tr key={response.status} className="border-t border-gray-800">
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">
                    {response.status}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {response.description ? (
                      <InlineMarkdown>{response.description}</InlineMarkdown>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export async function OperationReference({
  surface,
  tagSlug,
  operationSlug,
}: {
  surface: ApiSurface
  tagSlug: string
  operationSlug: string
}) {
  await deferWhenSpecUrlIsAPlaceholder()
  const full = await requireApiCatalog()
  const catalog = catalogForSurface(full, surface)
  const operation = findApiOperation(catalog, tagSlug, operationSlug)
  const tag = findApiTag(catalog, tagSlug)
  if (!operation || !tag) {
    // Not under this tag, but the catalog may still hold it under the one it was retagged
    // to. Send the reader — and the old URL's search signals — to the page that exists.
    const moved = findMovedApiOperation(full, operationSlug)
    if (moved) permanentRedirect(moved.path)
    notFound()
  }

  const reference =
    surface === 'extensions'
      ? {
          name: 'Extensions',
          path: EXTENSIONS_BASE_PATH,
          navLabel: 'Extensions reference',
        }
      : {
          name: 'API reference',
          path: API_BASE_PATH,
          navLabel: 'API reference',
        }
  const crumbs = [
    { name: 'Docs', path: '/docs' },
    reference,
    { name: tag.title, path: tag.path },
    { name: operation.summary, path: operation.path },
  ]
  const { previous, next } = apiNeighbors(tag, operation.slug)
  const pathParameters = operation.parameters.filter(
    (p) => p.location === 'path'
  )
  const queryParameters = operation.parameters.filter(
    (p) => p.location === 'query'
  )
  const headerParameters = operation.parameters.filter(
    (p) => p.location === 'header'
  )

  return (
    <ApiShell
      catalog={catalog}
      crumbs={crumbs}
      activeTag={tag.slug}
      activeOperation={operation.slug}
      basePath={reference.path}
      overviewLabel={reference.name}
      navLabel={reference.navLabel}
    >
      <DocsJsonLd
        page={{
          title: operation.summary,
          description: describe(operation),
          path: operation.path,
          updated: null,
        }}
        crumbs={crumbs}
      />

      <article>
        <header className="mb-8 border-b border-gray-800 pb-8">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {operation.summary}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
            <MethodBadge method={operation.method} />
            <code className="font-mono text-sm break-all text-gray-200">
              {operation.route}
            </code>
          </div>
          {operation.deprecated && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              This operation is deprecated and may be removed in a future
              release.
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Part of{' '}
            <Link href={tag.path} className="text-cyan-400 hover:text-cyan-300">
              {tag.title}
            </Link>
            .
          </p>
        </header>

        {operation.description && (
          <div className={PROSE}>
            <DocsMarkdown>{operation.description}</DocsMarkdown>
          </div>
        )}

        <Section id="authentication" title="Authentication">
          {operation.security.length > 0 ? (
            <>
              <p className="text-gray-300">
                {operation.security.length > 1
                  ? 'Authenticate in any one of these ways — not all of them:'
                  : 'Authenticate with:'}
              </p>
              <ul className="mt-3 space-y-2 text-gray-300">
                {operation.security.map((option) => (
                  <li key={option.map((s) => s.name).join('+')}>
                    <SecurityOption option={option} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-300">
              This operation does not require an API key.
            </p>
          )}
        </Section>

        {pathParameters.length > 0 && (
          <Section id="path-parameters" title="Path parameters">
            <ParameterTable catalog={catalog} parameters={pathParameters} />
          </Section>
        )}

        {queryParameters.length > 0 && (
          <Section id="query-parameters" title="Query parameters">
            <ParameterTable catalog={catalog} parameters={queryParameters} />
          </Section>
        )}

        {headerParameters.length > 0 && (
          <Section id="header-parameters" title="Header parameters">
            <ParameterTable catalog={catalog} parameters={headerParameters} />
          </Section>
        )}

        {operation.body && (
          <Section id="request-body" title="Request body">
            <p className="mb-4 text-sm text-gray-500">
              {operation.body.required ? 'Required' : 'Optional'},{' '}
              <code className="font-mono text-gray-400">
                {operation.body.contentType}
              </code>
              .
            </p>
            <SchemaFields catalog={catalog} schema={operation.body.schema} />
          </Section>
        )}

        <Section id="example-request" title="Example request">
          <div className="space-y-4">
            {curlExamples(catalog, operation).map((sample, i) => (
              <CodeBlock key={i} label={sample.label}>
                {sample.command}
              </CodeBlock>
            ))}
          </div>
        </Section>

        {operation.responses.length > 0 && (
          <Section id="responses" title="Responses">
            <ResponseBody catalog={catalog} operation={operation} />
          </Section>
        )}
      </article>

      {(previous || next) && (
        <nav
          aria-label="Previous and next operations"
          className="mt-12 grid gap-4 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={previous.path}
              className="rounded-lg border border-gray-800 p-4 transition-colors hover:border-cyan-500/50"
            >
              <span className="block text-xs text-gray-500">Previous</span>
              <span className="text-white">{previous.summary}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={next.path}
              className="rounded-lg border border-gray-800 p-4 text-right transition-colors hover:border-cyan-500/50"
            >
              <span className="block text-xs text-gray-500">Next</span>
              <span className="text-white">{next.summary}</span>
            </Link>
          )}
        </nav>
      )}
    </ApiShell>
  )
}
