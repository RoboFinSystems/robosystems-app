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
    'financial intelligence platform',
    'financial knowledge graph',
    'AI financial analysis',
    'AI financial reporting',
    'SEC XBRL data',
    'graph database for finance',
    'open source financial platform',
    'financial AI agents',
    'financial data relationships',
    'operational financial intelligence',
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
