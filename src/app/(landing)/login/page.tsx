import type { Metadata } from 'next'
import LoginForm from './content'

export const metadata: Metadata = {
  title: 'Sign In | RoboSystems',
  description: 'Sign in to your RoboSystems account.',
  // Auth utility page — no SEO value; keep it out of the index but follow links.
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return <LoginForm />
}
