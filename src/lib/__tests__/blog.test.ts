import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPostBySlug, withoutLeadingTitle, youtubeId } from '../blog'

const catalog = {
  posts: [
    {
      slug: 'a-post',
      title: 'A post',
      date: '2026-09-01',
      author: 'x',
      excerpt: 'e',
      assets: { body: 'https://cdn.test/a-post.md' },
    },
  ],
}

describe('getPostBySlug', () => {
  afterEach(() => vi.mocked(globalThis.fetch).mockReset())

  it('returns null only for a slug the catalog does not have', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(catalog))
    )
    await expect(getPostBySlug('missing')).resolves.toBeNull()
  })

  it('throws when the catalog cannot be read, rather than reporting a miss', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('', { status: 503 })
    )
    await expect(getPostBySlug('a-post')).rejects.toThrow()
  })

  it('throws when the post body cannot be read', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(catalog)))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
    await expect(getPostBySlug('a-post')).rejects.toThrow()
  })
})

describe('withoutLeadingTitle', () => {
  it('drops a body that opens with its own H1', () => {
    expect(
      withoutLeadingTitle(
        '# Information Blocks: Turning Line Items Into Reports\n\nA ledger and a report.'
      )
    ).toBe('\nA ledger and a report.')
  })

  it('drops it after leading blank lines', () => {
    expect(withoutLeadingTitle('\n\n# Title\nBody')).toBe('Body')
  })

  it('keeps a body that opens with a section heading or prose', () => {
    expect(withoutLeadingTitle('## The Modern Data Stack\nBody')).toBe(
      '## The Modern Data Stack\nBody'
    )
    expect(withoutLeadingTitle('In 1494, Pacioli wrote.')).toBe(
      'In 1494, Pacioli wrote.'
    )
  })

  it('removes only the first heading, not a later H1', () => {
    expect(withoutLeadingTitle('Intro\n\n# Later')).toBe('Intro\n\n# Later')
  })
})

describe('youtubeId', () => {
  it('reads an id from a bare id or any link to the video', () => {
    for (const value of [
      'twydr672bGo',
      'https://youtu.be/twydr672bGo',
      'https://www.youtube.com/watch?v=twydr672bGo',
      'https://www.youtube.com/watch?feature=share&v=twydr672bGo&t=4',
      'https://www.youtube.com/embed/twydr672bGo',
    ]) {
      expect(youtubeId(value)).toBe('twydr672bGo')
    }
  })

  it('gives nothing for a missing value or a link that is not a video', () => {
    expect(youtubeId(undefined)).toBeUndefined()
    expect(youtubeId('')).toBeUndefined()
    expect(youtubeId('https://example.com/watch?v=twydr672bGo')).toBeUndefined()
    expect(youtubeId('https://www.youtube.com/@robosystems')).toBeUndefined()
  })
})
