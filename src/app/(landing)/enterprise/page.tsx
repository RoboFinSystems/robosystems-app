import type { Metadata } from 'next'
import EnterpriseContent from './content'

export const metadata: Metadata = {
  title: 'Enterprise Deployment Options | RoboSystems',
  description:
    'Run RoboSystems on our managed platform, in an AWS account dedicated to you and operated by us, or self-hosted in your own account. SSO, SCIM, passkeys, and an account you can take with you.',
  keywords: [
    'dedicated deployment',
    'single-tenant financial platform',
    'enterprise SSO OIDC',
    'SCIM provisioning',
    'passkeys',
    'self-hosted financial platform',
    'financial knowledge graph enterprise',
  ],
  alternates: { canonical: 'https://robosystems.ai/enterprise' },
  openGraph: {
    type: 'website',
    url: 'https://robosystems.ai/enterprise',
    title: 'One platform. Three ways to run it. | RoboSystems',
    description:
      'Managed platform, a dedicated AWS account we operate for you, or self-hosted — the same open-source software and public API, and an exit that is a feature.',
  },
}

export default function EnterprisePage() {
  return <EnterpriseContent />
}
