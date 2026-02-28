import type { Metadata } from 'next'
import PricingContent from './content'

export const metadata: Metadata = {
  title: 'Pricing | RoboSystems',
  description:
    'Transparent pricing for your financial knowledge graph platform. All database operations included, only pay for AI agent calls.',
}

export default function PricingPage() {
  return <PricingContent />
}
