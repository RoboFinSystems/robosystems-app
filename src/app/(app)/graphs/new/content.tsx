'use client'

import GraphLimitModal from '@/components/app/GraphLimitModal'
import { GraphCreationPage } from '@/components/graphs/creation'
import {
  useGraphContext,
  useOrg,
  useUser,
  useUserLimits,
} from '@robosystems/core'
import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NewGraphContent() {
  const router = useRouter()
  const { user } = useUser()
  const { currentOrg } = useOrg()
  const { setCurrentGraph, refreshGraphs } = useGraphContext()
  const { canCreateGraph, isLoading, limits } = useUserLimits()
  const [showContactModal, setShowContactModal] = useState(false)

  // Check limits when component mounts or when loading completes
  useEffect(() => {
    if (!isLoading && !canCreateGraph) {
      setShowContactModal(true)
    }
  }, [isLoading, canCreateGraph])

  const handleSuccess = async (graphId: string) => {
    try {
      if (graphId) {
        // First refresh the graphs to ensure the new graph is in the list
        await refreshGraphs()

        // Then select the new graph through the context
        // This will update both the backend and the cookie
        await setCurrentGraph(graphId)

        // Use replace instead of push to prevent back button issues
        // and force a fresh mount of the dashboard component
        router.replace('/dashboard')

        // Trigger a router refresh to ensure all components re-render with new context
        router.refresh()
      } else {
        // If no graphId, just navigate
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to select new graph:', error)
      // Still navigate even if selection failed since graph was created
      router.push('/dashboard')
    }
  }

  const handleModalClose = () => {
    setShowContactModal(false)
    router.push('/dashboard')
  }

  // Show loading while checking limits
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  // Show contact modal if user can't create graphs
  if (!canCreateGraph) {
    return (
      <>
        <GraphLimitModal
          isOpen={showContactModal}
          onClose={handleModalClose}
          userEmail={user?.email || ''}
          currentLimit={limits?.max_graphs || 0}
          orgId={currentOrg?.id}
        />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="font-heading mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {(limits?.max_graphs || 0) === 0
                ? 'Graph Access Required'
                : 'Graph Creation Limit Reached'}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {(limits?.max_graphs || 0) === 0
                ? 'Graph creation requires approval. Request access to get started.'
                : `You have reached your maximum number of graphs (${limits?.max_graphs || 0} graphs allowed).`}
            </p>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              {(limits?.max_graphs || 0) === 0
                ? 'Request access'
                : 'Request a higher limit'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <GraphCreationPage
      // RoboSystems-specific configuration
      allowGenericGraphs={true} // Allow both entity and generic graphs
      requiredExtensions={[]} // No required extensions for flexibility
      allowedExtensions={['roboledger', 'roboinvestor']} // Only show relevant schemas
      showTierSelection={true}
      onSuccess={handleSuccess}
      backUrl="/dashboard"
      title="Create New Knowledge Graph"
    />
  )
}
