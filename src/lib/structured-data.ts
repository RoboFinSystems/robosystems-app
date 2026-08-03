// Site-wide Schema.org structured data. The Organization block is rendered in the root
// layout so every page carries publisher identity; the SoftwareApplication block is rendered
// on the homepage. `sameAs` mirrors the real social profiles linked from the footer.

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RoboSystems',
  url: 'https://robosystems.ai',
  logo: 'https://robosystems.ai/images/logo_black.png',
  description:
    'Open-source financial intelligence platform powered by knowledge graphs and AI agents',
  sameAs: [
    'https://github.com/RoboFinSystems',
    'https://x.com/robofinsystems',
    'https://www.linkedin.com/company/robosystems',
    'https://www.youtube.com/@RoboSystems',
  ],
  founder: {
    '@type': 'Person',
    name: 'Joseph French',
  },
}

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
    'Financial intelligence platform with knowledge graphs, AI agents, and SEC XBRL data for business analysis',
  screenshot: 'https://robosystems.ai/images/og-preview.png',
  featureList: [
    'Knowledge graph database',
    'AI agent integration',
    'SEC XBRL repository',
    'Document search',
    'AI memory',
    'QuickBooks sync',
    'Open source',
  ],
  softwareVersion: '1.0',
  url: 'https://robosystems.ai',
}
