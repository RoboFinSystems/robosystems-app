import type { Metadata } from 'next'
import PricingContent from './content'
import { pricingMetadata } from './metadata'

export const metadata: Metadata = pricingMetadata

export default function PricingPage() {
  return <PricingContent />
}
