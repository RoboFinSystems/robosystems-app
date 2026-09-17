import { getAllPosts } from '@/lib/blog'
import { DOCS_SITE, getDocsCatalog, getDocsNav, latestUpdate } from '@/lib/docs'
import { API_BASE_PATH, getApiCatalog } from '@/lib/openapi'
import type { MetadataRoute } from 'next'

/**
 * Newest valid date in a list, or none. A `lastmod` is a real date or absent: a date
 * stamped at request time teaches Bing and Google to ignore the field on every entry,
 * including the posts whose dates are true.
 */
function latestDate(dates: (string | undefined)[]): Date | undefined {
  const ts = dates
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getTime())
    .filter((n) => !Number.isNaN(n))
  return ts.length ? new Date(Math.max(...ts)) : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://robosystems.ai'

  // Get all blog posts (from the S3 catalog)
  const posts = await getAllPosts().catch(() => [])
  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Guides and technical docs from the docs catalog; lastmod is each page's last commit
  // in the robosystems repo (guides) or the wiki (technical).
  const catalog = await getDocsCatalog()
  const docsNavPages = (['product', 'technical'] as const).flatMap((layer) =>
    catalog ? (getDocsNav(catalog, DOCS_SITE, layer)?.ordered ?? []) : []
  )
  const docsPages: MetadataRoute.Sitemap = docsNavPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: page.updated ? new Date(page.updated) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // The API reference, from the live OpenAPI spec: the overview, a page per tag and a page
  // per operation. No lastModified anywhere in this block — the spec carries no per-
  // operation history, so the only date available is the API's release date, and stamping
  // it on all 200 pages would claim every operation changed on every release.
  const api = await getApiCatalog()
  const apiPages: MetadataRoute.Sitemap = api
    ? [
        { url: `${baseUrl}${API_BASE_PATH}`, priority: 0.8 },
        ...api.tags.map((tag) => ({
          url: `${baseUrl}${tag.path}`,
          priority: 0.6,
        })),
        ...api.operations.map((operation) => ({
          url: `${baseUrl}${operation.path}`,
          priority: 0.5,
        })),
      ].map((entry) => ({ ...entry, changeFrequency: 'monthly' as const }))
    : []

  // The research portal lives on roboinvestor.ai (its sitemap lists it); /research and
  // /research/:ticker here are 308s in next.config.js and are deliberately not listed.
  // Static pages send no lastModified: they change on deploys, and nothing here knows
  // when. /register is noindex and left out.
  const newestPost = latestDate(posts.map((p) => p.date))
  const staticPages: MetadataRoute.Sitemap = [
    { path: '/platform', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/enterprise', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pages/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/pages/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/pages/msa', changeFrequency: 'yearly', priority: 0.3 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: changeFrequency as 'monthly' | 'yearly',
    priority,
  }))

  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPost,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: latestUpdate(docsNavPages),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...staticPages,
    ...docsPages,
    ...apiPages,
    ...blogPosts,
  ]
}
