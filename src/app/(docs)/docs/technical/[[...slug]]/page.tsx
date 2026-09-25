import { DocsArticle } from '@/components/docs/DocsArticle'
import {
  GET_STARTED_HEADINGS,
  TechnicalGetStarted,
} from '@/components/docs/TechnicalGetStarted'
import {
  DOCS_SITE,
  findDocsPage,
  getDocsBody,
  getDocsCatalog,
  getDocsNav,
} from '@/lib/docs'
import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// The wiki, rendered at robosystems.ai/docs/technical. The index page is the wiki's Home,
// opened by the get-started section that replaced the /open-source page.

export const revalidate = 300

type Props = { params: Promise<{ slug?: string[] }> }

async function load(slug?: string[]) {
  if (slug && slug.length > 1) return null
  const catalog = await getDocsCatalog()
  const nav = catalog && getDocsNav(catalog, DOCS_SITE, 'technical')
  const page = nav && findDocsPage(nav, slug?.[0] ?? 'index')
  return nav && page ? { nav, page } : null
}

export async function generateStaticParams() {
  // A catalog the build cannot read leaves every page to render on demand.
  const catalog = await getDocsCatalog().catch(() => null)
  const nav = catalog && getDocsNav(catalog, DOCS_SITE, 'technical')
  return (nav?.ordered ?? []).map((page) => ({
    slug: page.slug === 'index' ? [] : [page.slug],
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).slug)
  if (!found) return { title: 'Page Not Found | RoboSystems Docs' }
  return publicPageMetadata({
    path: found.page.path,
    title: `${found.page.title} | RoboSystems Docs`,
    description: found.page.description,
  })
}

export default async function TechnicalDocsPage({ params }: Props) {
  const found = await load((await params).slug)
  if (!found) notFound()
  const body = await getDocsBody(found.page)

  const { nav, page } = found
  const isIndex = page.slug === 'index'
  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'Technical docs', path: nav.collection.base_path },
    ...(isIndex ? [] : [{ name: page.title, path: page.path }]),
  ]

  return (
    <DocsArticle
      nav={nav}
      page={page}
      body={body}
      crumbs={crumbs}
      collectionTitle="Technical docs"
      lead={isIndex ? <TechnicalGetStarted /> : undefined}
      leadHeadings={isIndex ? GET_STARTED_HEADINGS : undefined}
    />
  )
}
