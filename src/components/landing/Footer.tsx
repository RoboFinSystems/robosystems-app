'use client'

import { LandingFooter } from '@robosystems/core'
import ContactModal from './ContactModal'

export default function Footer() {
  return (
    <LandingFooter
      tagline="Open-source knowledge graph platform for financial and operational intelligence. Transform your data into a semantic layer that AI agents can understand and reason over."
      productLinks={[
        { label: 'Platform', href: '/platform' },
        { label: 'Applications', href: '/#applications' },
        { label: 'Open Source', href: '/open-source' },
        { label: 'Pricing', href: '/pricing' },
      ]}
      contactModal={ContactModal}
    />
  )
}
