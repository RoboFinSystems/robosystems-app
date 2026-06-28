import type { Metadata } from 'next'
import RegisterForm from './content'

export const metadata: Metadata = {
  title: 'Create Account | RoboSystems',
  description:
    'Create a RoboSystems account — build financial knowledge graphs, search SEC filings, and analyze with AI agents via MCP.',
  alternates: { canonical: 'https://robosystems.ai/register' },
}

export default function RegisterPage() {
  return <RegisterForm />
}
