import type { Metadata } from 'next'
import RegisterForm from './content'

export const metadata: Metadata = {
  title: 'Create Account | RoboSystems',
  description:
    'Create a RoboSystems account — build financial knowledge graphs, search SEC filings, and analyze with AI agents via MCP.',
  alternates: { canonical: 'https://robosystems.ai/register' },
  // Nothing here for search: the form renders client-side and registration completes on
  // the login home. roboledger.ai and roboinvestor.ai noindex theirs too.
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  return <RegisterForm />
}
