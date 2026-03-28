import type { Metadata } from 'next'
import { DocumentsPageContent } from './content'

export const metadata: Metadata = {
  title: 'Knowledge Base | Financial Intelligence Platform',
  description: 'Upload and manage knowledge base documents for your graph',
}

export default function DocumentsPage() {
  return <DocumentsPageContent />
}
