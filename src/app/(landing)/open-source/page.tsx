import type { Metadata } from 'next'
import OpenSourceContent from './content'

export const metadata: Metadata = {
  title: 'Open Source | RoboSystems',
  description:
    'Build financial analysis tools with SEC filings, graph databases, and AI integration. Query company financials with Claude Desktop, Claude Code, or deploy to AWS.',
}

export default function OpenSourcePage() {
  return <OpenSourceContent />
}
