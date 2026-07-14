import type { Metadata } from 'next'
import { MemoryPageContent } from './content'

export const metadata: Metadata = {
  title: 'Memory | Financial Intelligence Platform',
  description: 'View, search, and manage the semantic memory of your graph',
}

export default function MemoryPage() {
  return <MemoryPageContent />
}
