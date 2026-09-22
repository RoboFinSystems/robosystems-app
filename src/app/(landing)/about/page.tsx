import { OG_IMAGE } from '@/lib/site'
import type { Metadata } from 'next'
import AboutContent from './content'

export const metadata: Metadata = {
  title: 'About | RoboSystems',
  description:
    'Who builds RoboSystems and why: open-source financial reporting, planning and analysis for small and growing businesses, built on well-kept data so the AI on top actually helps.',
  alternates: { canonical: 'https://robosystems.ai/about' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/about',
    title: 'About RoboSystems',
    description:
      'Open-source financial tooling for small and growing businesses, built for the right reasons. We run our own books on it.',
    images: [OG_IMAGE],
  },
}

export default function AboutPage() {
  return <AboutContent />
}
