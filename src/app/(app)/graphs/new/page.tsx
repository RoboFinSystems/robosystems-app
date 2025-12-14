import type { Metadata } from 'next'
import { NewGraphContent } from './content'

export const metadata: Metadata = {
  title: 'Create Graph Database | RoboSystems',
  description: 'Create a new graph database for your company',
}

export default function NewGraphPage() {
  return <NewGraphContent />
}
