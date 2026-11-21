// Pages built to be found: one page per query. A `product` page answers a query whose
// results are the product itself; a `category` page explains a term we use, and is the one
// page our posts on it link to. Metadata, structured data, the sitemap entry, the llms.txt
// line and the footer link all come from this registry, so a page cannot ship half-wired;
// __tests__/product-pages.test.ts checks every entry against the SEO rules.

import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './site'
import { ORGANIZATION_ID } from './structured-data'

export type ProductPageType = 'product' | 'category'

export interface ProductPage {
  type: ProductPageType
  /** URL path, also the route segment under app/(pages). */
  path: string
  /** The one query this page answers. It leads the title and appears in the H1. */
  query: string
  /** <title>: the query first, then `| RoboSystems`. */
  title: string
  /** Search snippet: contains the query, 160 characters or fewer. */
  description: string
  h1: string
  /** Footer link label. */
  navLabel: string
  /** Social-card eyebrow and subtitle. */
  ogEyebrow: string
  ogSubtitle: string
  /** The docs page the page's claims are checked against. */
  docsPath: string
  /** Last substantive edit (YYYY-MM-DD): the sitemap's lastmod. */
  updated: string
  /** A category page's one-sentence definition of its term (DefinedTerm). */
  definition?: string
}

export const PRODUCT_PAGES: ProductPage[] = [
  {
    type: 'category',
    path: '/knowledge-graph-for-finance',
    query: 'knowledge graph for finance',
    title: 'Knowledge Graph for Finance, Explained | RoboSystems',
    description:
      'A knowledge graph for finance holds the ledger and the public filings as connected facts, so every number opens to the entries behind it. Open source.',
    h1: 'What a knowledge graph for finance is, and what it holds',
    navLabel: 'Knowledge graph for finance',
    ogEyebrow: 'Knowledge graph for finance',
    ogSubtitle:
      'The ledger and the public filings as connected facts your AI can trace.',
    docsPath: '/docs/technical/core-concepts',
    updated: '2026-11-21',
    definition:
      "A knowledge graph for finance stores a company's financial facts (each number with its concept, period, entity and source) as connected nodes, labelled in a shared vocabulary, so software and AI can read them the way an accountant would.",
  },
  {
    type: 'product',
    path: '/sec-edgar-api',
    query: 'sec edgar api',
    title: 'SEC EDGAR API for XBRL Financial Data | RoboSystems',
    description:
      "An SEC EDGAR API over 8,000+ public companies' XBRL filings: statements, comparisons and filing text over REST or MCP. 14-day trial, no card.",
    h1: 'SEC EDGAR API: public companies’ filings as structured facts',
    navLabel: 'SEC EDGAR API',
    ogEyebrow: 'SEC EDGAR API',
    ogSubtitle: "8,000+ public companies' XBRL filings, read over REST or MCP.",
    docsPath: '/docs/guides/sec-filings',
    updated: '2026-11-21',
  },
  {
    type: 'category',
    path: '/context-graph',
    query: 'context graph',
    title: 'Context Graph: What It Means for Finance | RoboSystems',
    description:
      'Context graph has several definitions. In finance it is what a knowledge graph carries: the entries, events and sources behind each number.',
    h1: 'Context graph: what the term means, and what it means in finance',
    navLabel: 'Context graph',
    ogEyebrow: 'Context graph',
    ogSubtitle:
      'The entries, events and sources behind each number, held in a knowledge graph.',
    docsPath: '/docs/technical/event-driven-ledger',
    updated: '2026-11-21',
    definition:
      'A context graph is a graph of the context an AI system needs to act on a question: the entities involved and the events, decisions and sources around them. The term has several competing definitions.',
  },
]

export function getProductPage(path: string): ProductPage {
  const page = PRODUCT_PAGES.find((p) => p.path === path)
  if (!page) throw new Error(`No product page registered at ${path}`)
  return page
}

export function productPageUrl(page: ProductPage): string {
  return `${SITE_URL}${page.path}`
}

export function productPageMetadata(page: ProductPage): Metadata {
  const url = productPageUrl(page)
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      type: page.type === 'category' ? 'article' : 'website',
      url,
      siteName: SITE_NAME,
      // og:image comes from the generated opengraph-image.tsx in the page's segment.
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  }
}

function subjectNode(page: ProductPage, url: string) {
  if (page.type === 'category') {
    return {
      '@type': 'Article',
      headline: page.h1,
      description: page.description,
      url,
      dateModified: page.updated,
      about: {
        '@type': 'DefinedTerm',
        name: page.query,
        description: page.definition,
      },
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
    }
  }
  return {
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    // No `offers`: /pricing carries the prices.
    description: page.description,
    url,
    image: `${SITE_URL}/images/logos/robosystems-icon.png`,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function productPageJsonLd(page: ProductPage) {
  const url = productPageUrl(page)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      subjectNode(page, url),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: page.navLabel, item: url },
        ],
      },
    ],
  }
}
