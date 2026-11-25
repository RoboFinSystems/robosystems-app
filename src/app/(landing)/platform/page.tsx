import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import PlatformContent from './content'

export const metadata: Metadata = publicPageMetadata({
  path: '/platform',
  title: 'Knowledge graph platform for finance | RoboSystems',
  description:
    "Three kinds of knowledge graphs on one platform: your company's books or portfolio, public companies' SEC filings to compare against, and your own schema.",
})

export default function PlatformPage() {
  return <PlatformContent />
}
