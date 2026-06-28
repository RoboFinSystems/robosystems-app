import type { Metadata } from 'next'
import TermsOfService from './content'

export const metadata: Metadata = {
  title: 'Terms of Service | RoboSystems',
  description:
    'The terms governing your use of the RoboSystems financial intelligence platform.',
  alternates: { canonical: 'https://robosystems.ai/pages/terms' },
}

export default function TermsPage() {
  return <TermsOfService />
}
