import type { Metadata } from 'next'
import PrivacyPolicy from './content'

export const metadata: Metadata = {
  title: 'Privacy Policy | RoboSystems',
  description:
    'How RoboSystems collects, uses, and protects your data across the financial intelligence platform.',
  alternates: { canonical: 'https://robosystems.ai/pages/privacy' },
}

export default function PrivacyPage() {
  return <PrivacyPolicy />
}
