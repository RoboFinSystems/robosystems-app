import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoboSystems: the open-source knowledge graph for finance',
    short_name: 'RoboSystems',
    description:
      "The open-source knowledge graph for finance: your company's books or portfolio as traceable data for your AI, beside public companies' SEC filings, over MCP.",
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/logos/robosystems-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logos/robosystems-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
