import type { Metadata } from 'next'

export const landingMetadata: Metadata = {
  title: 'RoboSystems | Financial Knowledge Graphs for AI-Powered Intelligence',
  description:
    'Transform your financial data into a powerful knowledge graph. Connect QuickBooks, analyze with AI agents using MCP tools, and discover insights hidden in the relationships between revenue, costs, and operations.',
  keywords: [
    'financial knowledge graph',
    'graph database for finance',
    'AI financial analysis',
    'MCP tools finance',
    'GraphRAG financial intelligence',
    'QuickBooks knowledge graph',
    'financial data relationships',
    'open source financial platform',
    'graph database platform',
    'financial AI agents',
    'unit economics calculator',
    'operational financial intelligence',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://robosystems.ai',
    siteName: 'RoboSystems',
    title: 'Financial Knowledge Graphs | AI-Powered Business Intelligence',
    description:
      'Stop wrestling with disconnected spreadsheets. Build a financial knowledge graph that connects revenue to operations, costs to activities, and data to decisions.',
    images: [
      {
        url: '/images/logo_black.png',
        width: 512,
        height: 512,
        alt: 'RoboSystems - Transform Financial Data into Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoboSystems | Financial Knowledge Graphs',
    description:
      'The open-source platform for building financial knowledge graphs. Connect your data, deploy AI agents, discover hidden insights.',
    images: ['/images/logo_black.png'],
    creator: '@robosystems',
  },
  alternates: {
    canonical: 'https://robosystems.ai',
  },
}

// Organization structured data for the landing page
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RoboSystems',
  url: 'https://robosystems.ai',
  logo: 'https://robosystems.ai/images/logo_black.png',
  description:
    'Open-source platform for building financial knowledge graphs with AI-powered intelligence',
  sameAs: [
    'https://github.com/RoboFinSystems',
    'https://twitter.com/robofinsystems',
    'https://github.com/RoboFinSystems/robosystems/discussions',
  ],
  founder: {
    '@type': 'Person',
    name: 'Joseph French',
  },
}

// Software Application structured data
export const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RoboSystems',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Financial knowledge graph platform with AI agents for intelligent business analysis',
  screenshot: 'https://robosystems.ai/images/logo_black.png',
  featureList: [
    'Knowledge graph database',
    'AI agent integration',
    'QuickBooks sync',
    'MCP tools',
    'GraphRAG capabilities',
    'Open source',
  ],
  softwareVersion: '1.0',
  url: 'https://robosystems.ai',
}
