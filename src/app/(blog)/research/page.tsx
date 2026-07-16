import { ResearchListJsonLd } from '@/components/research/ResearchJsonLd'
import { CoverageBrowser, getAllCoverage } from '@robosystems/core/research'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const TITLE = 'Research | RoboSystems'
const DESCRIPTION =
  'Equity research from the filings — one public company per report, every figure traceable to an SEC filing. No price targets.'
const URL = 'https://robosystems.ai/research'

export async function generateMetadata(): Promise<Metadata> {
  // Use the newest report's thumbnail as the OG preview when available; otherwise
  // Next falls back to the brand image set in the root layout.
  const items = await getAllCoverage().catch(() => [])
  const image = items.find((i) => i.assets.thumbnail)?.assets.thumbnail
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: URL },
    openGraph: {
      type: 'website',
      url: URL,
      siteName: 'RoboSystems',
      title: TITLE,
      description: DESCRIPTION,
      images: image
        ? [{ url: image, width: 1920, height: 1080, alt: TITLE }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: image ? [image] : undefined,
    },
  }
}

// Short ISR window so catalog/publish/sync-youtube changes show up in minutes, not an hour.
export const revalidate = 300

export default async function ResearchPage() {
  const items = await getAllCoverage().catch(() => [])

  return (
    <div className="dark min-h-screen bg-black">
      <ResearchListJsonLd items={items} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/robosystems.png"
                alt="RoboSystems Logo"
                width={60}
                height={60}
                className="mr-3"
              />
              <span className="font-heading text-4xl font-bold whitespace-nowrap text-white">
                RoboSystems
              </span>
            </Link>
          </div>
          <h1 className="font-heading text-center text-5xl font-bold md:text-6xl">
            <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Research
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-300">
            Equity research straight from the filings — one public company per
            report, every figure traceable to an SEC filing. No hype, no price
            targets.
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <CoverageBrowser items={items} />
      </div>
    </div>
  )
}
