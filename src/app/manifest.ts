import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoboSystems | Financial Intelligence Platform',
    short_name: 'RoboSystems',
    description:
      'Unify structured data, document search, and AI memory in one platform — knowledge graphs, SEC filings search, and AI agents via MCP.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/logos/robosystems.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
