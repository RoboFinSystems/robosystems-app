import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import PricingContent from './content'

export const metadata: Metadata = publicPageMetadata({
  path: '/pricing',
  title: 'Pricing | RoboSystems',
  description:
    'Managed hosting from $99 a graph, the SEC repository with a 14-day trial, Dedicated quoted per engagement, and self-hosting free under Apache 2.0 and MIT.',
})

export default function PricingPage() {
  return <PricingContent />
}
