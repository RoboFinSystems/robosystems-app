import type { Metadata } from 'next'
import { TablesContent } from './content'

export const metadata: Metadata = {
  title: 'Tables | RoboSystems',
  description: 'Manage staging tables and data ingestion',
}

export default function TablesPage() {
  return <TablesContent />
}
