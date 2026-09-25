import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/blog', () => ({ getPostBySlug: vi.fn() }))
vi.mock('@/lib/og', () => ({
  OG_SIZE: { width: 1200, height: 630 },
  OG_CONTENT_TYPE: 'image/png',
  CARD_CACHE_CONTROL:
    'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
  renderOgImage: vi.fn(
    () =>
      new Response('png', {
        headers: {
          'content-type': 'image/png',
          'cache-control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      })
  ),
}))

import { getPostBySlug } from '@/lib/blog'
import { renderOgImage } from '@/lib/og'
import Image from '../opengraph-image'

describe('blog post card', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the card for a known post', async () => {
    vi.mocked(getPostBySlug).mockResolvedValue({
      slug: 'a-post',
      site: 'robosystems',
      title: 'A post',
      date: '2026-09-01',
      author: 'x',
      excerpt: 'Short.',
    })
    const res = await Image({ params: Promise.resolve({ slug: 'a-post' }) })
    expect(res.status).toBe(200)
    expect(renderOgImage).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'A post' })
    )
  })

  it('answers 404 for an unknown slug without rendering', async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(null)
    const res = await Image({ params: Promise.resolve({ slug: 'nope' }) })
    expect(res.status).toBe(404)
    expect(renderOgImage).not.toHaveBeenCalled()
  })
})
