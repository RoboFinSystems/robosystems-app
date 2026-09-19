import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Everything below is authenticated product surface (the (app) route
      // group) — no SEO value and login-gated, so keep crawlers off it. None of
      // these appear in sitemap.ts, which lists only the marketing and blog
      // pages. Add a route here whenever one is added to (app). Rules match by
      // prefix, so each is the bare segment: '/home/' would leave /home itself
      // crawlable. /billing is not in (app); it is a redirect in next.config.js.
      disallow: [
        '/api',
        '/backups',
        '/billing',
        '/checkout',
        '/connect',
        '/console',
        '/dashboard',
        '/documents',
        '/graphs',
        '/home',
        '/memory',
        '/organization',
        '/repositories',
        '/schema',
        '/search',
        '/settings',
        '/subgraphs',
        '/tables',
        '/usage',
      ],
    },
    sitemap: 'https://robosystems.ai/sitemap.xml',
  }
}
