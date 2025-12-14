import type { Metadata } from 'next'
import { BillingContent } from './content'

export const metadata: Metadata = {
  title: 'Billing & Credits | RoboSystems',
  description: 'Manage your subscriptions, credits, and billing information',
}

export default function BillingPage() {
  return <BillingContent />
}
