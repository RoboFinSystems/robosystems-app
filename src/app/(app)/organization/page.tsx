import type { Metadata } from 'next'
import { OrganizationContent } from './content'

export const metadata: Metadata = {
  title: 'Organization | RoboSystems',
  description: 'Manage your organization and members',
}

export default function OrganizationPage() {
  return <OrganizationContent />
}
