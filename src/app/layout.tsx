import { AuthProvider } from '@/lib/core'
import { SessionWarningDialog } from '@/lib/core/auth-components/SessionWarningDialog'
import { organizationJsonLd } from '@/lib/structured-data'
import { ThemeModeScript } from 'flowbite-react'
import type { Metadata, Viewport } from 'next'
import { twMerge } from 'tailwind-merge'

import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://robosystems.ai'),
  title: 'RoboSystems | Financial Intelligence Platform',
  description:
    'Unify structured data, document search, and AI memory in one platform. Query knowledge graphs, search SEC filings with hybrid full-text and semantic search, and analyze with AI agents via MCP.',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://robosystems.ai',
    siteName: 'RoboSystems',
    title: 'RoboSystems | Financial Intelligence Platform',
    description:
      'Unify structured data, document search, and AI memory in one platform. Query knowledge graphs, search SEC filings with hybrid full-text and semantic search, and analyze with AI agents via MCP.',
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
      'Unify structured data, document search, and AI memory in one platform. Hybrid full-text and semantic search across SEC filings, with AI-powered analysis via MCP.',
    images: ['/images/og-preview.png'],
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
        <AuthProvider>
          <SessionWarningDialog />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
