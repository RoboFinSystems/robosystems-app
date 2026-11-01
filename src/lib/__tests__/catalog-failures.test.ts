import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAllPosts } from '../blog'

// An unreadable catalog must throw, not read as "no posts": during ISR
// regeneration a throw keeps the last good render, while a [] is cached as an empty list
// for the whole revalidate window.
describe('content catalogs when the CDN fails', () => {
  afterEach(() => vi.mocked(globalThis.fetch).mockReset())

  it('getAllPosts throws', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('', { status: 503 })
    )
    await expect(getAllPosts()).rejects.toThrow()
  })
})
