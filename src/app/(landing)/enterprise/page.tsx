import { OG_IMAGE } from '@/lib/site'
import type { Metadata } from 'next'
import EnterpriseContent from './content'

export const metadata: Metadata = {
  title: 'Enterprise Deployment Options | RoboSystems',
  description:
    'Run RoboSystems managed by us, in a segregated AWS account we run under our SOC 2 program, or on your own server, with help from Harbinger FinLab.',
  keywords: [
    'dedicated deployment',
    'single-tenant financial platform',
    'enterprise SSO OIDC',
    'SCIM provisioning',
    'passkeys',
    'self-hosted financial platform',
    'financial knowledge graph enterprise',
    'SOC 2 Type II',
  ],
  alternates: { canonical: 'https://robosystems.ai/enterprise' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/enterprise',
    title: 'One platform. Three ways to run it. | RoboSystems',
    description:
      'Managed platform, a segregated AWS account we run for you, or self-hosted: the same open-source software and public API, and an exit that is a feature.',
    images: [OG_IMAGE],
  },
}

export default function EnterprisePage() {
  return <EnterpriseContent />
}
