'use client'

import { LandingFooter } from '@robosystems/core'
import ContactModal from './ContactModal'

export default function Footer() {
  return (
    <LandingFooter
      tagline="The open-source knowledge graph for finance. Your general ledger and public companies' filings as traceable data for your AI, on your infrastructure, with the model you choose."
      productLinks={[
        { label: 'Platform', href: '/platform' },
        { label: 'Enterprise', href: '/enterprise' },
        { label: 'Applications', href: '/#applications' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Docs', href: '/docs' },
      ]}
      contactModal={ContactModal}
    />
  )
}
