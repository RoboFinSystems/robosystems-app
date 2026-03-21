import type { Metadata } from 'next'
import PlatformContent from './content'

export const metadata: Metadata = {
  title: 'Platform Features | RoboSystems',
  description:
    'Explore the RoboSystems platform - financial intelligence with knowledge graphs, document search, and AI-native tools for accounting and investment research.',
}

export default function PlatformPage() {
  return <PlatformContent />
}
