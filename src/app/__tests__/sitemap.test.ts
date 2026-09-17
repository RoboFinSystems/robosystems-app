import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetAllPosts = vi.fn()

vi.mock('@/lib/blog', () => ({
  getAllPosts: () => mockGetAllPosts(),
}))

import sitemap from '../sitemap'

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
