import type { Metadata } from 'next'

// The homepage's identity in one place, and the metadata every public marketing page
// shares. Until 2026-09-16 the homepage carried four different descriptions (the <meta>,
// the social card, the Twitter card and the root layout's), one of them pitching the
// QuickBooks sync that is roboledger.ai's lane, and three subpages had no canonical and
// inherited the homepage's og:url. The description stays under 160 characters so results
// show it whole.

export const SITE_NAME = 'RoboSystems'
export const SITE_URL = 'https://robosystems.ai'

export const SITE_TITLE = 'RoboSystems | Financial Intelligence Platform'

export const SITE_DESCRIPTION =
  'Every number, every document, one platform your AI can reason over: a financial knowledge graph, search across filings and documents, and MCP tools.'

export const OG_IMAGE = {
  url: '/images/og-preview.png',
  width: 1200,
  height: 630,
  alt: 'RoboSystems - Financial Intelligence Platform',
}

/**
 * Canonical, Open Graph and Twitter card for a public marketing page. A page that sets
 * `openGraph` replaces the parent's object whole, image included, so each page states
 * all of it rather than inheriting half.
 */
export function publicPageMetadata({
  path,
  title,
  description,
}: {
  path: string
  title: string
  description: string
}): Pick<
  Metadata,
  'title' | 'description' | 'alternates' | 'openGraph' | 'twitter'
> {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
