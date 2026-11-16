import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import PlatformContent from './content'

export const metadata: Metadata = publicPageMetadata({
  path: '/platform',
  title: 'Knowledge graph platform for finance | RoboSystems',
  description:
    "Three kinds of graph on one platform: your ledger, public companies' XBRL filings, and graphs you model yourself, with one ontology underneath.",
})

export default function PlatformPage() {
  return <PlatformContent />
}
