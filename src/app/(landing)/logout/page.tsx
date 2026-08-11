import type { Metadata } from 'next'
import LogoutContent from './content'

export const metadata: Metadata = {
  title: 'Sign Out | RoboSystems',
  description: 'Sign out of your RoboSystems account.',
  // Auth utility page — no SEO value.
  robots: { index: false, follow: false },
}

export default function LogoutPage() {
  return <LogoutContent />
}
