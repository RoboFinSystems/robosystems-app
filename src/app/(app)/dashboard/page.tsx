import type { Metadata } from 'next'
import { GraphDashboardContent } from './content'

export const metadata: Metadata = {
  title: 'Graph Dashboard | RoboSystems',
  description: 'View and manage your graph database',
}

export default function DashboardPage() {
  return <GraphDashboardContent />
}
