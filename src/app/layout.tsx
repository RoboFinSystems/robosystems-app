import { CloudflareAnalytics } from '@/components/analytics/CloudflareAnalytics'
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site'
import { organizationJsonLd } from '@/lib/structured-data'
import { AuthProvider, customTheme } from '@robosystems/core'
import { SessionWarningDialog } from '@robosystems/core/auth-components/SessionWarningDialog'
import { ThemeModeScript, ThemeProvider } from 'flowbite-react'
import type { Metadata, Viewport } from 'next'
import { twMerge } from 'tailwind-merge'

import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://robosystems.ai'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    'financial intelligence platform',
    'financial knowledge graph',
    'document search',
    'semantic search',
    'graph database for finance',
    'AI financial analysis',
    'MCP tools',
    'GraphRAG finance',
    'SEC filings search',
    'OpenSearch',
    'open source financial software',
  ],
  authors: [{ name: 'Joey French' }],
  creator: 'RoboSystems',
  publisher: 'RoboSystems',
  // No `url` here: every page without its own openGraph inherits this object, and a
  // site-wide og:url told crawlers those pages were the homepage.
  openGraph: {
    type: 'website',
    locale: 'en_US',
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
    site: '@robofinsystems',
    creator: '@robofinsystems',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body
        className={twMerge('bg-zinc-50 font-sans dark:bg-black')}
        suppressHydrationWarning
      >
        <ThemeProvider theme={customTheme}>
          <AuthProvider>
            <SessionWarningDialog />
            {children}
          </AuthProvider>
        </ThemeProvider>
        <CloudflareAnalytics />
      </body>
    </html>
  )
}
