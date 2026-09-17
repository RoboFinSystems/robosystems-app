import { DOCS_SITE, getDocsCatalog, getDocsNav } from '@/lib/docs'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

// The docs landing: one door per kind of documentation, then every guide and every
// technical page by section, so the landing links both sets in its server HTML. The Guides
// door appears only once the catalog carries the collection, so it never links a 404.

export const revalidate = 300

const TITLE = 'Documentation | RoboSystems'
const DESCRIPTION =
  'Guides to using RoboSystems through Claude, ChatGPT and other MCP clients, technical documentation for the platform, and the REST API reference.'

export const metadata: Metadata = publicPageMetadata({
  path: '/docs',
  title: TITLE,
  description: DESCRIPTION,
})

const GUIDES_DOOR = {
  title: 'Guides',
  href: '/docs/guides',
  body: 'Use the platform through Claude, ChatGPT or any MCP client: connect, choose a graph, analyze SEC filings.',
  external: false,
}

const DOORS = [
  {
    title: 'Technical docs',
    href: '/docs/technical',
    body: 'Build on, run and extend the platform: graphs, the MCP server, the operations and GraphQL surfaces, the SEC pipeline, and self-hosting.',
    external: false,
  },
  {
    title: 'RoboLedger',
    href: 'https://roboledger.ai/docs',
    body: 'Connect QuickBooks and work with your books through Claude or ChatGPT: analyze, report, plan, and close the month.',
    external: true,
  },
  {
    title: 'API reference',
    href: 'https://api.robosystems.ai/docs',
    body: 'Every REST endpoint, with its request and response schemas.',
    external: true,
  },
]

export default async function DocsLandingPage() {
  const catalog = await getDocsCatalog()
  const technical = catalog && getDocsNav(catalog, DOCS_SITE, 'technical')
  const guides = catalog && getDocsNav(catalog, DOCS_SITE, 'product')
  const hasGuides = !!guides && guides.ordered.length > 0
  const doors = hasGuides ? [GUIDES_DOOR, ...DOORS] : DOORS

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          RoboSystems is an open-source financial knowledge graph platform, and
          the platform behind RoboLedger and RoboInvestor. Start with the
          documentation for what you are doing.
        </p>
      </header>

      <div
        className={`grid gap-6 ${hasGuides ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}
      >
        {doors.map((door) => {
          const className =
            'group block rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-cyan-500/50 hover:bg-gray-900/70'
          const content = (
            <>
              <h2 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                {door.title}
              </h2>
              <p className="text-sm text-gray-400">{door.body}</p>
            </>
          )
          return door.external ? (
            <a key={door.title} href={door.href} className={className}>
              {content}
            </a>
          ) : (
            <Link key={door.title} href={door.href} className={className}>
              {content}
            </Link>
          )
        })}
      </div>

      {guides && hasGuides && (
        <section className="mt-16">
          <h2 className="font-heading mb-8 text-2xl font-bold text-white">
            Guides
          </h2>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {guides.ordered.map((page) => (
              <li key={page.slug}>
                <Link
                  href={page.path}
                  className="text-gray-300 transition-colors hover:text-cyan-400"
                >
                  {page.slug === 'index' ? 'Overview' : page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {technical && technical.sections.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading mb-8 text-2xl font-bold text-white">
            Technical docs
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {technical.sections.map((section, i) => (
              <div key={section.title ?? i}>
                {section.title && (
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-2">
                  {section.pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={page.path}
                        className="text-gray-300 transition-colors hover:text-cyan-400"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
