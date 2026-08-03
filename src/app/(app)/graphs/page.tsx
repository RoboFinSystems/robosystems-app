'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function GraphsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Legacy route. /home is where you manage your graphs — it lists them all
    // and selects one. /dashboard manages the graph you already selected, so
    // sending the plural route there dropped you a level too deep.
    router.replace('/home')
  }, [router])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  )
}
