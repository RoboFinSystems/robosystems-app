'use client'

import { SubgraphCreationWizard } from '@/components/subgraph/SubgraphCreationWizard'
import { useGraphContext, useToast } from '@/lib/core'
import { customTheme } from '@/lib/core/theme'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { HiArrowLeft } from 'react-icons/hi'

export function NewSubgraphContent() {
  const router = useRouter()
  const { state } = useGraphContext()
  const { showError } = useToast()
  const currentGraph = state.currentGraphId

  const handleCancel = () => {
    router.push('/subgraphs')
  }

  const handleSuccess = async (subgraphName: string) => {
    router.push('/subgraphs')
  }

  if (!currentGraph) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Button
                  theme={customTheme.button}
                  color="gray"
                  size="sm"
                  onClick={handleCancel}
                  className="mr-4"
                >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Subgraph
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                No Graph Selected
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Please select a graph first before creating a subgraph.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push('/home')}
                theme={customTheme.button}
              >
                Select Graph
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                theme={customTheme.button}
                color="gray"
                size="sm"
                onClick={handleCancel}
                className="mr-4"
              >
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Subgraph
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <SubgraphCreationWizard
          graphId={currentGraph}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
          className="mx-auto max-w-3xl"
        />
      </div>
    </div>
  )
}
