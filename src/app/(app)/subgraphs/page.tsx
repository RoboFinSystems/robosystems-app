import type { Metadata } from 'next'
import { SubgraphsContent } from './content'

export const metadata: Metadata = {
  title: 'Subgraphs | RoboSystems',
  description: 'Manage your graph subgraphs and environments',
}

export default function SubgraphsPage() {
  return <SubgraphsContent />
}
