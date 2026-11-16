import { OG_IMAGE } from '@/lib/site'
import type { Metadata } from 'next'
import AboutContent from './content'

export const metadata: Metadata = {
  title: 'About | RoboSystems',
  description:
    "Who builds RoboSystems: an inactive CPA and ex-Workiva knowledge engineer. The open-source knowledge graph for finance, with our own companies' books kept on it.",
  alternates: { canonical: 'https://robosystems.ai/about' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/about',
    title: 'About RoboSystems',
    description:
      "Who builds RoboSystems: an inactive CPA and ex-Workiva knowledge engineer. The open-source knowledge graph for finance, with our own companies' books kept on it.",
    images: [OG_IMAGE],
  },
}

export default function AboutPage() {
  return <AboutContent />
}
