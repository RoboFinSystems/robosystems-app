import { OperationReference } from '@/components/docs/api/OperationReference'
import {
  catalogForSurface,
  findApiOperation,
  findApiTag,
  getApiCatalog,
  requireApiCatalog,
  summarize,
  type ApiOperation,
} from '@/lib/openapi'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'

// One page per REST operation: what it takes, what it returns, and a call you can run.
// Every page is pre-rendered from the spec the API is actually serving, and an operation
// added after the build renders on first request rather than 404ing until the next deploy.

// Next only reads a literal here, so this cannot be API_REVALIDATE_SECONDS; the two
// are the same hour and are asserted equal in the openapi tests.
export const revalidate = 3600
export const dynamicParams = true

type Props = { params: Promise<{ tag: string; operation: string }> }

/** The page's data, or null when the spec simply has no such operation. */
async function load(tag: string, operation: string) {
  const catalog = catalogForSurface(await requireApiCatalog(), 'extensions')
  const found = findApiOperation(catalog, tag, operation)
  const group = findApiTag(catalog, tag)
  return found && group ? { catalog, operation: found, tag: group } : null
}

export async function generateStaticParams() {
  const full = await getApiCatalog()
  const catalog = full ? catalogForSurface(full, 'extensions') : null
  return (catalog?.operations ?? [])
    .filter((operation) => operation.tagSlug !== 'graphql')
    .map((operation) => ({
      tag: operation.tagSlug,
      operation: operation.slug,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, operation } = await params
  const found = await load(tag, operation)
  if (!found) return { title: 'Page Not Found | RoboSystems extensions' }
  return publicPageMetadata({
    path: found.operation.path,
    title: `${found.operation.summary} | RoboSystems extensions`,
    description: describe(found.operation),
  })
}

/** The meta description: the operation's own prose where it has some, else its call. */
function describe(operation: ApiOperation): string {
  const prose = summarize(operation.description)
  if (prose) return prose
  return `${operation.method.toUpperCase()} ${operation.route} — ${operation.summary} on the RoboSystems extensions surface.`
}

export default async function ExtensionsOperationPage({ params }: Props) {
  const { tag, operation } = await params
  return (
    <OperationReference
      surface="extensions"
      tagSlug={tag}
      operationSlug={operation}
    />
  )
}
