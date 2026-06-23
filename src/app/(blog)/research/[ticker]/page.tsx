import {
  ResearchArticle,
  fetchBrief,
  getCoverage,
  getCoverageTickers,
} from '@/lib/core/research'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

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
  return {
    title: `${item.title} | RoboSystems Research`,
    description: item.summary?.slice(0, 160),
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
