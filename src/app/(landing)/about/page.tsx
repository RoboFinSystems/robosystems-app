import { OG_IMAGE } from '@/lib/site'
import type { Metadata } from 'next'
import AboutContent from './content'

export const metadata: Metadata = {
  title: 'About | RoboSystems',
  description:
    'Who builds RoboSystems, the open-source knowledge graph for finance: an ex-Workiva principal financial knowledge engineer and inactive CPA.',
  alternates: { canonical: 'https://robosystems.ai/about' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/about',
    title: 'About RoboSystems',
    description:
      'Who builds RoboSystems, the open-source knowledge graph for finance: an ex-Workiva principal financial knowledge engineer and inactive CPA.',
    images: [OG_IMAGE],
  },
}

export default function AboutPage() {
  return <AboutContent />
}
