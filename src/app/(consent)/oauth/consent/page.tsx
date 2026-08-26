import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ConsentContent } from './content'

export const metadata: Metadata = {
  title: 'Authorize access | RoboSystems',
  description:
    'Approve or deny an application’s request to access RoboSystems.',
  robots: { index: false, follow: false },
}

export default function ConsentPage() {
  return (
    <Suspense fallback={null}>
      <ConsentContent />
    </Suspense>
  )
}
