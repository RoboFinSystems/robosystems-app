'use client'

import { useCreditContext } from '@/lib/core'
import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface GraphRedirectProps {
  targetPath: (graphId: string) => string
  loadingMessage?: string
  fallbackPath?: string
}

export function GraphRedirect({
  targetPath,
  loadingMessage = 'Loading...',
  fallbackPath = '/dashboard',
}: GraphRedirectProps) {
  const router = useRouter()
  const { currentGraphId, isLoading } = useCreditContext()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Wait for CreditContext to finish loading
    if (isLoading) return

    // Prevent multiple redirects
    if (redirecting) return

    setRedirecting(true)

    if (currentGraphId) {
      // We have a graph, redirect to the target path
      router.replace(targetPath(currentGraphId))
    } else {
      // No graph available, redirect to fallback
      router.replace(fallbackPath)
    }
  }, [currentGraphId, isLoading, router, targetPath, fallbackPath, redirecting])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <div className="text-gray-500 dark:text-gray-400">{loadingMessage}</div>
      </div>
    </div>
  )
}
