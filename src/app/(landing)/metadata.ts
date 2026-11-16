import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site'
import type { Metadata } from 'next'

export const landingMetadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    'knowledge graph for finance',
    'open source knowledge graph',
    'accounting ontology',
    'finance AI',
    'XBRL knowledge graph',
    'SEC EDGAR API',
    'MCP server for finance',
    'self-hosted finance AI',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
    creator: '@robofinsystems',
  },
  alternates: {
    canonical: SITE_URL,
  },
}
