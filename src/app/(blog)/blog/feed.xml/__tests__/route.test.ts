import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetAllPosts = vi.fn()

vi.mock('@/lib/blog', () => ({
  getAllPosts: () => mockGetAllPosts(),
}))

import { GET } from '../route'

describe('GET /blog/feed.xml', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('lists the lane newest first, escaped, dated by the newest post', async () => {
    mockGetAllPosts.mockResolvedValue([
      {
        slug: 'information-blocks',
        title: 'Information Blocks & Reports',
        date: '2026-07-29',
        author: 'Joey French',
        excerpt: 'Why a ledger cannot <yet> do it.',
      },
      {
        slug: 'semantic-sovereignty',
        title: 'Semantic Sovereignty',
        date: '2026-07-26',
        author: 'Joey French',
        excerpt: 'sovereignty',
        metaDescription: 'The meta description wins.',
      },
    ])

    const res = await GET()
    const body = await res.text()

    expect(res.headers.get('Content-Type')).toContain('application/rss+xml')
    expect(body).toContain('<title>Information Blocks &amp; Reports</title>')
    expect(body).toContain('Why a ledger cannot &lt;yet&gt; do it.')
    expect(body).toContain(
      '<description>The meta description wins.</description>'
    )
    expect(body).toContain(
      '<guid isPermaLink="true">https://robosystems.ai/blog/semantic-sovereignty</guid>'
    )
    expect(body.indexOf('information-blocks')).toBeLessThan(
      body.indexOf('semantic-sovereignty')
    )
    expect(body).toContain(
      `<lastBuildDate>${new Date('2026-07-29').toUTCString()}</lastBuildDate>`
    )
  })

  it('is a valid empty channel when the lane has no posts', async () => {
    mockGetAllPosts.mockResolvedValue([])

    const body = await (await GET()).text()

    expect(body).toContain('<channel>')
    expect(body).not.toContain('<item>')
    expect(body).not.toContain('<lastBuildDate>')
  })
})
