import { API_BASE_PATH, type ApiCatalog } from '@/lib/openapi'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Crumb } from '../DocsJsonLd'

// The reference's frame: the tag nav, the breadcrumb, and the page.
//
// The nav is deliberately plain. Every element it renders is paid for twice — once in the
// HTML and again in the RSC payload beside it — and the reference has 233 pages, so a
// method badge per sidebar row cost more than the whole rest of a small operation page.
// The desktop sidebar expands the tag the reader is in, so its sibling operations are one
// click away; the mobile disclosure lists tags only, and the tag page carries the rest.

function TagLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block rounded px-2 py-1 transition-colors ${
        active
          ? 'bg-cyan-500/10 text-cyan-300'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

function TagNav({
  catalog,
  activeTag,
  activeOperation,
  expand = false,
  basePath = API_BASE_PATH,
  overviewLabel = 'Overview',
}: {
  catalog: ApiCatalog
  activeTag?: string
  activeOperation?: string
  /** Whether the active tag lists its operations. Off for the mobile disclosure. */
  expand?: boolean
  /** The reference this nav belongs to: the platform API, or the extensions surface. */
  basePath?: string
  overviewLabel?: string
}) {
  return (
    <div className="space-y-1 text-sm">
      <TagLink href={basePath} active={!activeTag}>
        {overviewLabel}
      </TagLink>
      {catalog.tags.map((tag) => {
        const open = tag.slug === activeTag
        return (
          <div key={tag.slug}>
            <TagLink href={tag.path} active={open && !activeOperation}>
              {tag.title}
            </TagLink>
            {open && expand && (
              <ul className="my-1 ml-2 space-y-0.5 border-l border-gray-800 pl-2">
                {tag.operations.map((operation) => (
                  <li key={operation.slug}>
                    <Link
                      href={operation.path}
                      aria-current={
                        operation.slug === activeOperation ? 'page' : undefined
                      }
                      className={
                        operation.slug === activeOperation
                          ? 'block rounded px-2 py-1 text-cyan-300'
                          : 'block rounded px-2 py-1 text-gray-500 hover:text-white'
                      }
                    >
                      {operation.summary}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ApiShell({
  catalog,
  crumbs,
  activeTag,
  activeOperation,
  basePath = API_BASE_PATH,
  overviewLabel = 'Overview',
  children,
}: {
  catalog: ApiCatalog
  crumbs: Crumb[]
  activeTag?: string
  activeOperation?: string
  basePath?: string
  overviewLabel?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="flex gap-10">
        <nav
          aria-label="API reference"
          className="sticky top-28 hidden max-h-[calc(100vh-8rem)] w-64 shrink-0 self-start overflow-y-auto pb-8 lg:block"
        >
          <TagNav
            basePath={basePath}
            overviewLabel={overviewLabel}
            catalog={catalog}
            activeTag={activeTag}
            activeOperation={activeOperation}
            expand
          />
        </nav>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((crumb, i) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={crumb.path} className="hover:text-cyan-400">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-300">{crumb.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <details className="mb-8 rounded-lg border border-gray-800 bg-gray-900/50 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-gray-300">
              Browse the API reference
            </summary>
            <div className="mt-4">
              <TagNav
                basePath={basePath}
                overviewLabel={overviewLabel}
                catalog={catalog}
                activeTag={activeTag}
              />
            </div>
          </details>

          {children}
        </div>
      </div>
    </div>
  )
}
