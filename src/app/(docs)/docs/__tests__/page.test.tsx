import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockGetDocsCatalog = vi.fn()

vi.mock('@/lib/docs', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getDocsCatalog: () => mockGetDocsCatalog(),
}))

import type { DocsCatalog, DocsCollection, DocsPage } from '@/lib/docs'
import DocsLandingPage from '../page'

const docsPage = (site: string, slug: string, path: string): DocsPage => ({
  site,
  layer: 'product',
  slug,
  path,
  title: slug,
  description: '',
  section: null,
  order: 0,
  updated: null,
  body: `${site}/${slug}.md`,
  source_url: '',
})

const roboledger: DocsCollection = {
  site: 'roboledger',
  layer: 'product',
  base_path: '/docs',
  sections: [{ title: null, slugs: ['index'] }],
}

const roboinvestor: DocsCollection = {
  site: 'roboinvestor',
  layer: 'product',
  base_path: '/docs',
  sections: [{ title: null, slugs: ['index', 'build-a-portfolio'] }],
}

const catalog = (
  collections: DocsCollection[],
  pages: DocsPage[]
): DocsCatalog => ({
  schema_version: 1,
  digest: 'test',
  collections,
  pages,
})

/** The door titles, in order. Doors are h3; the h2s are the section labels. */
async function doorTitles(): Promise<string[]> {
  render(await DocsLandingPage())
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent ?? '')
}

/** The labelled sections a reader sees above the doors. */
async function sectionTitles(): Promise<string[]> {
  render(await DocsLandingPage())
  return screen
    .getAllByRole('heading', { level: 2 })
    .map((h) => h.textContent ?? '')
}

describe('DocsLandingPage', () => {
  afterEach(() => {
    mockGetDocsCatalog.mockReset()
  })

  it('shows the RoboInvestor door once the catalog carries its guides', async () => {
    mockGetDocsCatalog.mockResolvedValue(
      catalog(
        [roboledger, roboinvestor],
        [
          docsPage('roboledger', 'index', '/docs'),
          docsPage('roboinvestor', 'index', '/docs'),
          docsPage(
            'roboinvestor',
            'build-a-portfolio',
            '/docs/build-a-portfolio'
          ),
        ]
      )
    )

    expect(await doorTitles()).toEqual([
      'RoboLedger',
      'RoboInvestor',
      'Platform API',
      'Extensions API',
      'Technical docs',
    ])
    expect(
      screen.getByRole('link', { name: /^RoboInvestor/ }).getAttribute('href')
    ).toBe('https://roboinvestor.ai/docs')
  })

  it('omits the RoboInvestor door when the catalog has no such collection', async () => {
    mockGetDocsCatalog.mockResolvedValue(
      catalog([roboledger], [docsPage('roboledger', 'index', '/docs')])
    )

    const titles = await doorTitles()
    expect(titles).toEqual([
      'RoboLedger',
      'Platform API',
      'Extensions API',
      'Technical docs',
    ])
    expect(screen.queryByRole('link', { name: /^RoboInvestor/ })).toBeNull()
  })

  it('labels the doors as guides and reference', async () => {
    mockGetDocsCatalog.mockResolvedValue(
      catalog([roboledger], [docsPage('roboledger', 'index', '/docs')])
    )

    expect(await sectionTitles()).toEqual(
      expect.arrayContaining(['Guides', 'Reference'])
    )
  })

  it('omits the RoboInvestor door when its collection has no pages', async () => {
    mockGetDocsCatalog.mockResolvedValue(catalog([roboinvestor], []))

    expect(await doorTitles()).not.toContain('RoboInvestor')
  })

  it('omits the RoboInvestor door when the catalog cannot be loaded', async () => {
    mockGetDocsCatalog.mockResolvedValue(null)

    expect(await doorTitles()).toEqual([
      'RoboLedger',
      'Platform API',
      'Extensions API',
      'Technical docs',
    ])
  })
})
