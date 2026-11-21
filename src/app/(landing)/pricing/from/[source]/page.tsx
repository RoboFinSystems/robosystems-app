import { markedRegisterPath, parseTrialSource } from '@/lib/trial-source'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PricingContent from '../../content'
import { pricingMetadata } from '../../metadata'

// /pricing with a source marker (src/lib/trial-source.ts): the same page, canonical to
// /pricing and kept out of the index, whose buttons carry the marker on to /register.
export const metadata: Metadata = {
  ...pricingMetadata,
  robots: { index: false, follow: true },
}

export default async function MarkedPricingPage({
  params,
}: {
  params: Promise<{ source: string }>
}) {
  const source = parseTrialSource((await params).source)
  if (!source) notFound()
  return <PricingContent registerHref={markedRegisterPath(source)} />
}
