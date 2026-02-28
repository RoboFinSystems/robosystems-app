import type { Metadata } from 'next'
import PlatformContent from './content'

export const metadata: Metadata = {
  title: 'Platform Features | RoboSystems',
  description:
    'Explore the RoboSystems platform - SaaS and PaaS solutions for financial management, accounting, and business intelligence.',
}

export default function PlatformPage() {
  return <PlatformContent />
}
