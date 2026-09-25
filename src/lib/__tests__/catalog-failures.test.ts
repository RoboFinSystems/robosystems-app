import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAllPosts } from '../blog'
import { getDocsBody, getDocsCatalog, type DocsPage } from '../docs'

// An unreadable catalog must throw, not read as "no posts" or "no such page": during ISR
// regeneration a throw keeps the last good render, while a null/[] is cached as a 404 or
// an empty list for the whole revalidate window.
describe('content catalogs when the CDN fails', () => {
  afterEach(() => vi.mocked(globalThis.fetch).mockReset())

  it('getAllPosts throws', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('', { status: 503 })
    )
    await expect(getAllPosts()).rejects.toThrow()
  })

  it('getDocsCatalog throws', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('', { status: 503 })
    )
    await expect(getDocsCatalog()).rejects.toThrow()
  })

  it('getDocsBody throws', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('', { status: 503 })
    )
    await expect(
      getDocsBody({ body: 'pages/x.md', path: '/docs/x' } as DocsPage)
    ).rejects.toThrow()
  })
})
