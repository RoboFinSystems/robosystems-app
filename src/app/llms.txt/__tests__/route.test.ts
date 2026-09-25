import type * as Docs from '@/lib/docs'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetAllPosts = vi.fn()
const mockGetDocsCatalog = vi.fn()

vi.mock('@/lib/blog', () => ({
  getAllPosts: () => mockGetAllPosts(),
}))

vi.mock('@/lib/docs', async (importOriginal) => ({
  ...(await importOriginal<typeof Docs>()),
  getDocsCatalog: () => mockGetDocsCatalog(),
}))

import { GET } from '../route'

const page = (layer: 'product' | 'technical', slug: string, title: string) => ({
  site: 'robosystems',
  layer,
  slug,
  path: `/docs/${layer === 'product' ? 'guides' : 'technical'}/${slug}`,
  title,
  description: `About ${title}\nacross two lines.`,
  section: null,
  order: 0,
  updated: null,
  body: '',
  source_url: '',
})

describe('GET /llms.txt', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maps the site from the docs and blog catalogs', async () => {
    mockGetDocsCatalog.mockResolvedValue({
      schema_version: 1,
      digest: '',
      collections: [
        {
          site: 'robosystems',
          layer: 'product',
          base_path: '/docs/guides',
          sections: [{ title: null, slugs: ['sec-filings'] }],
        },
        {
          site: 'robosystems',
          layer: 'technical',
          base_path: '/docs/technical',
          sections: [{ title: null, slugs: ['quick-start'] }],
        },
      ],
      pages: [
        page('product', 'sec-filings', 'SEC filings'),
        page('technical', 'quick-start', 'Quick start'),
      ],
    })
    mockGetAllPosts.mockResolvedValue([
      {
        slug: 'building-financial-context-graphs',
        title: 'Building Financial Context Graphs',
        date: '2026-01-12',
        author: 'Joey French',
        excerpt: 'excerpt',
        metaDescription: 'Context graphs are the semantic layer.',
      },
    ])

    const res = await GET()
    const body = await res.text()

    expect(res.headers.get('Content-Type')).toContain('text/plain')
    expect(body.startsWith('# RoboSystems\n\n> ')).toBe(true)
    expect(body).toContain(
      '- [SEC filings](https://robosystems.ai/docs/guides/sec-filings): About SEC filings across two lines.'
    )
    expect(body).toContain(
      '- [Quick start](https://robosystems.ai/docs/technical/quick-start)'
    )
    expect(body).toContain(
      '- [Building Financial Context Graphs](https://robosystems.ai/blog/building-financial-context-graphs): Context graphs are the semantic layer.'
    )
    expect(body).toContain('https://robosystems.ai/about')
  })
})
