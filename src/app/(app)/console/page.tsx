import type { Metadata } from 'next'
import { QueryInterfaceContent } from './content'

export const metadata: Metadata = {
  title: 'Query Interface | RoboSystems',
  description: 'Execute Cypher queries on your graph database',
}

export default function QueryPage() {
  return <QueryInterfaceContent />
}
