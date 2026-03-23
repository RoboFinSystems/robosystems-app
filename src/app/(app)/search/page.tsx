import type { Metadata } from 'next'
import { SearchPageContent } from './content'

export const metadata: Metadata = {
  title: 'Document Search | RoboSystems',
  description: 'Search documents across your graph',
}

export default function SearchPage() {
  return <SearchPageContent />
}
