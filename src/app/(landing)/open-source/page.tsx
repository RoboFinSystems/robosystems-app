import { publicPageMetadata } from '@/lib/site'
import type { Metadata } from 'next'
import OpenSourceContent from './content'

export const metadata: Metadata = publicPageMetadata({
  path: '/open-source',
  title: 'Open Source | RoboSystems',
  description:
    'Build financial analysis tools with SEC filings, graph databases, and AI integration. Query company financials from Claude, ChatGPT, Grok, or any MCP client, or deploy to AWS.',
})

export default function OpenSourcePage() {
  return <OpenSourceContent />
}
