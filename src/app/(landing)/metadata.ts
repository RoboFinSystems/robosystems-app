import type { Metadata } from 'next'

export const landingMetadata: Metadata = {
  title: 'RoboSystems | Financial Intelligence Platform',
  description:
    'Transform your financial data into a powerful knowledge graph. Connect QuickBooks, analyze with AI agents using MCP tools, and discover insights hidden in the relationships between revenue, costs, and operations.',
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
    url: 'https://robosystems.ai',
    siteName: 'RoboSystems',
    title: 'Financial Intelligence Platform | AI-Powered Business Intelligence',
    description:
      'Stop wrestling with disconnected spreadsheets. Build a financial knowledge graph that connects revenue to operations, costs to activities, and data to decisions.',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'RoboSystems - Financial Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoboSystems | Financial Intelligence Platform',
    description:
      'The open-source platform for building financial knowledge graphs. Connect your data, deploy AI agents, discover hidden insights.',
    images: ['/images/og-preview.png'],
    creator: '@robofinsystems',
  },
  alternates: {
    canonical: 'https://robosystems.ai',
  },
}
