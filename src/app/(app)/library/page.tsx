import type { Metadata } from 'next'
import { LibraryContent } from './content'

export const metadata: Metadata = {
  title: 'Taxonomy Library | Financial Intelligence Platform',
  description:
    'Browse and inspect shared reporting taxonomies, elements, and classifications.',
}

export default function LibraryPage() {
  return <LibraryContent />
}
