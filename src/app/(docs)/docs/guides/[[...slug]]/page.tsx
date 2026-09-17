import { DocsArticle } from '@/components/docs/DocsArticle'
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

// The platform guides, rendered at robosystems.ai/docs/guides from docs/product/robosystems
// in the robosystems repo: how to use the platform through an AI client, for the person
// and the model. Pages shared by RoboLedger and RoboInvestor live here once.

export const revalidate = 300

type Props = { params: Promise<{ slug?: string[] }> }

async function load(slug?: string[]) {
  if (slug && slug.length > 1) return null
  const catalog = await getDocsCatalog()
  const nav = catalog && getDocsNav(catalog, DOCS_SITE, 'product')
  const page = nav && findDocsPage(nav, slug?.[0] ?? 'index')
  return nav && page ? { nav, page } : null
}

export async function generateStaticParams() {
  const catalog = await getDocsCatalog()
  const nav = catalog && getDocsNav(catalog, DOCS_SITE, 'product')
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

export default async function GuidesPage({ params }: Props) {
  const found = await load((await params).slug)
  if (!found) notFound()
  const body = await getDocsBody(found.page)
  if (body === null) notFound()

  const { nav, page } = found
  const crumbs = [
    { name: 'Docs', path: '/docs' },
    { name: 'Guides', path: nav.collection.base_path },
    ...(page.slug === 'index' ? [] : [{ name: page.title, path: page.path }]),
  ]

  return (
    <DocsArticle
      nav={nav}
      page={page}
      body={body}
      crumbs={crumbs}
      collectionTitle="Guides"
    />
  )
}
