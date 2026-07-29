import { ResearchJsonLd } from '@/components/research/ResearchJsonLd'
import {
  ResearchArticle,
  fetchBrief,
  getCoverage,
  getCoverageTickers,
} from '@robosystems/core/research'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Short ISR window so catalog/publish/sync-youtube changes show up in minutes, not an hour.
export const revalidate = 300

export async function generateStaticParams() {
  const tickers = await getCoverageTickers().catch(() => [])
  return tickers.map((t) => ({ ticker: t.toLowerCase() }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>
}): Promise<Metadata> {
  const { ticker } = await params
  const item = await getCoverage(ticker).catch(() => null)
  if (!item) return { title: 'Research | RoboSystems' }
  const url = `https://robosystems.ai/research/${ticker.toLowerCase()}`
  const image = item.assets.thumbnail // 1920×1080 CDN PNG — the report thumbnail
  // Search vs social split. `title`/`summary` are the editorial copy, written for a
  // YouTube thumbnail ("The First $100B Software Profit — Is the AI Capex Worth It?"),
  // and Google was printing them verbatim: /research ranks ~7 and earned 0.00% CTR over
  // 363 impressions. The catalog now also carries query-shaped seo_* copy — use it for
  // the SERP, and keep the editorial hook on the OG/Twitter cards, where it works.
  // Widened locally: @robosystems/core's CoverageItem predates these fields.
  const seo = item as typeof item & {
    seo_title?: string
    seo_description?: string
  }
  return {
    title: `${seo.seo_title || item.title} | RoboSystems Research`,
    description: (seo.seo_description || item.summary).slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: item.title,
      description: item.summary.slice(0, 200),
      images: image
        ? [{ url: image, width: 1920, height: 1080, alt: item.title }]
        : undefined,
      publishedTime: item.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.summary.slice(0, 200),
      images: image ? [image] : undefined,
    },
  }
}

export default async function ResearchTickerPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params
  const item = await getCoverage(ticker).catch(() => null)
  if (!item) notFound()

  const briefMarkdown = item.assets.brief
    ? await fetchBrief(item.assets.brief).catch(() => '')
    : ''

  return (
    <div className="dark min-h-screen bg-black text-gray-100">
      <ResearchJsonLd item={item} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/research"
          className="mb-8 inline-block text-sm text-cyan-400 hover:underline"
        >
          ← All research
        </Link>
        <ResearchArticle item={item} briefMarkdown={briefMarkdown} />
      </div>
    </div>
  )
}
