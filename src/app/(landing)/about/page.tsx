import { OG_IMAGE } from '@/lib/site'
import type { Metadata } from 'next'
import AboutContent from './content'

export const metadata: Metadata = {
  title: 'About | RoboSystems',
  description:
    "Who builds RoboSystems and why: a company's books, its plan and the public filing record on one structured reporting model, open source, and run on our own books.",
  alternates: { canonical: 'https://robosystems.ai/about' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/about',
    title: 'About RoboSystems',
    description:
      "A company's books, its plan and the public filing record on one structured reporting model. Open source, and run on our own books.",
    images: [OG_IMAGE],
  },
}

export default function AboutPage() {
  return <AboutContent />
}
