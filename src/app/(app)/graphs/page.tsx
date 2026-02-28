'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function GraphsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard - the graphs functionality is now integrated there
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-gray-500">Redirecting to dashboard...</div>
    </div>
  )
}
