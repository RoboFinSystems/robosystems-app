import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetAllPosts = vi.fn()
const mockGetDocsCatalog = vi.fn()
const mockGetApiCatalog = vi.fn()
const mockGetGraphqlCatalog = vi.fn()

vi.mock('@/lib/blog', () => ({
  getAllPosts: () => mockGetAllPosts(),
}))

vi.mock('@/lib/docs', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getDocsCatalog: () => mockGetDocsCatalog(),
}))

vi.mock('@/lib/openapi', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getApiCatalog: () => mockGetApiCatalog(),
}))

// Unmocked, getGraphqlCatalog would reach api.robosystems.ai for the live schema.
// It fails soft to null so nothing breaks, but a suite that touches the public
// internet is nondeterminism waiting to happen.
vi.mock('@/lib/graphql', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getGraphqlCatalog: () => mockGetGraphqlCatalog(),
}))

import type { DocsCatalog, DocsLayer, DocsPage } from '@/lib/docs'
import { buildCatalog } from '@/lib/openapi'
import sitemap from '../sitemap'

const docsPage = (
  layer: DocsLayer,
  slug: string,
  path: string,
  updated: string | null
): DocsPage => ({
  site: 'robosystems',
  layer,
  slug,
  path,
  title: slug,
  description: '',
  section: null,
  order: 0,
  updated,
  body: `${layer}/${slug}.md`,
  source_url: '',
})

const docsCatalog: DocsCatalog = {
  schema_version: 1,
  digest: 'test',
  collections: [
    {
      site: 'robosystems',
      layer: 'product',
      base_path: '/docs/guides',
      sections: [{ title: null, slugs: ['index', 'connect-an-mcp-client'] }],
    },
    {
      site: 'robosystems',
      layer: 'technical',
      base_path: '/docs/technical',
      sections: [{ title: 'Getting Started', slugs: ['quick-start'] }],
    },
    {
      site: 'roboledger',
      layer: 'product',
      base_path: '/docs',
      sections: [{ title: null, slugs: ['connect-your-books'] }],
    },
  ],
  pages: [
    docsPage('product', 'index', '/docs/guides', '2026-09-17T10:00:00-05:00'),
    docsPage(
      'product',
      'connect-an-mcp-client',
      '/docs/guides/connect-an-mcp-client',
      '2026-09-17T11:00:00-05:00'
    ),
    docsPage(
      'technical',
      'quick-start',
      '/docs/technical/quick-start',
      '2026-09-16T09:00:00-05:00'
    ),
    {
      ...docsPage(
        'product',
        'connect-your-books',
        '/docs/connect-your-books',
        null
      ),
      site: 'roboledger',
    },
  ],
}

const apiCatalog = buildCatalog({
  info: { title: 'RoboSystems API', version: '1.12.6' },
  tags: [{ name: 'Graphs', description: 'Graphs' }],
  paths: {
    '/v1/graphs': {
      get: {
        tags: ['Graphs'],
        summary: 'List Graphs',
        operationId: 'listGraphs',
        responses: {},
      },
    },
  },
  components: { schemas: {}, securitySchemes: {} },
})

const posts = [
  { slug: 'semantic-sovereignty', date: '2026-08-20' },
  { slug: 'information-blocks', date: '2026-06-12' },
]

// A lastmod is a real date or absent. A date stamped at request time teaches Bing and
// Google to ignore the field on every entry, including the posts whose dates are true.
describe('sitemap', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('sends no lastmod for the homepage or the static pages', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    const entries = await sitemap()
    const undated = entries.filter((e) => !e.url.includes('/blog'))

    expect(undated.map((e) => e.url)).toEqual(
      expect.arrayContaining([
        'https://robosystems.ai',
        'https://robosystems.ai/platform',
        'https://robosystems.ai/pricing',
        'https://robosystems.ai/pages/terms',
      ])
    )
    for (const entry of undated) {
      expect(entry.lastModified).toBeUndefined()
    }
  })

  it('dates the blog hub by its newest post and each post by its own date', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    const byUrl = new Map((await sitemap()).map((e) => [e.url, e.lastModified]))

    expect(byUrl.get('https://robosystems.ai/blog')).toEqual(
      new Date('2026-08-20')
    )
    expect(byUrl.get('https://robosystems.ai/blog/information-blocks')).toEqual(
      new Date('2026-06-12')
    )
  })

  it('sends no lastmod for the hub when the catalog is unreachable', async () => {
    mockGetAllPosts.mockRejectedValue(new Error('catalog down'))
    const hub = (await sitemap()).find(
      (e) => e.url === 'https://robosystems.ai/blog'
    )

    expect(hub?.lastModified).toBeUndefined()
  })

  it('lists the guides and technical docs, dated by their last commit', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetDocsCatalog.mockResolvedValue(docsCatalog)
    const entries = await sitemap()
    const byUrl = new Map(entries.map((e) => [e.url, e]))

    expect(
      byUrl.get('https://robosystems.ai/docs/guides')?.lastModified
    ).toEqual(new Date('2026-09-17T10:00:00-05:00'))
    expect(
      byUrl.get('https://robosystems.ai/docs/guides/connect-an-mcp-client')
    ).toBeDefined()
    expect(
      byUrl.get('https://robosystems.ai/docs/technical/quick-start')
        ?.lastModified
    ).toEqual(new Date('2026-09-16T09:00:00-05:00'))
    expect(
      entries.some((e) => e.url.endsWith('/docs/connect-your-books'))
    ).toBe(false)
    expect(byUrl.get('https://robosystems.ai/docs')?.lastModified).toEqual(
      new Date('2026-09-17T11:00:00-05:00')
    )
  })

  it('still lists the static pages when the docs catalog is unreachable', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetDocsCatalog.mockResolvedValue(null)
    const urls = (await sitemap()).map((e) => e.url)

    expect(urls).toContain('https://robosystems.ai/docs')
    expect(urls.some((u) => u.includes('/docs/guides'))).toBe(false)
  })

  it('lists the API reference, undated: the spec has no per-operation history', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetApiCatalog.mockResolvedValue(apiCatalog)
    const byUrl = new Map((await sitemap()).map((e) => [e.url, e]))

    for (const url of [
      'https://robosystems.ai/docs/api',
      'https://robosystems.ai/docs/api/graphs',
      'https://robosystems.ai/docs/api/graphs/list-graphs',
    ]) {
      expect(byUrl.get(url)).toBeDefined()
      expect(byUrl.get(url)?.lastModified).toBeUndefined()
    }
  })

  it('lists the GraphQL reference, undated: the schema has no per-field history', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetGraphqlCatalog.mockResolvedValue({
      serverUrl: 'https://api.robosystems.ai',
      endpointPath: '/extensions/{graph_id}/graphql',
      fields: [
        { slug: 'fiscal-calendar' },
        { slug: 'open-receivables-by-agent' },
      ],
      domains: [],
      types: {},
    })
    const byUrl = new Map((await sitemap()).map((e) => [e.url, e]))

    for (const url of [
      'https://robosystems.ai/docs/extensions/graphql',
      'https://robosystems.ai/docs/extensions/graphql/fiscal-calendar',
      'https://robosystems.ai/docs/extensions/graphql/open-receivables-by-agent',
    ]) {
      expect(byUrl.get(url)).toBeDefined()
      expect(byUrl.get(url)?.lastModified).toBeUndefined()
    }
  })

  it('still lists the rest when the GraphQL schema is unreachable', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetGraphqlCatalog.mockResolvedValue(null)
    const urls = (await sitemap()).map((e) => e.url)

    expect(urls).toContain('https://robosystems.ai/docs')
    expect(urls.some((u) => u.includes('/docs/extensions/graphql'))).toBe(false)
  })

  it('still lists the rest when the OpenAPI spec is unreachable', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    mockGetApiCatalog.mockResolvedValue(null)
    const urls = (await sitemap()).map((e) => e.url)

    expect(urls).toContain('https://robosystems.ai/docs')
    expect(urls.some((u) => u.includes('/docs/api'))).toBe(false)
  })

  it('leaves out /register, which is noindex', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    const urls = (await sitemap()).map((e) => e.url)

    expect(urls).not.toContain('https://robosystems.ai/register')
  })

  it('is byte-identical across fetches', async () => {
    mockGetAllPosts.mockResolvedValue(posts)
    const first = JSON.stringify(await sitemap())
    await new Promise((resolve) => setTimeout(resolve, 5))

    expect(JSON.stringify(await sitemap())).toEqual(first)
  })
})
