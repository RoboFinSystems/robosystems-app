'use client'

import {
  SUBGRAPH_NAME_MAX_LENGTH,
  SUBGRAPH_NAME_PATTERN,
  subgraphIdFor,
} from '@/lib/mcp'
import { client, createSubgraph } from '@robosystems/client'
import { useToast } from '@robosystems/core'
import { customTheme } from '@robosystems/core/theme'
import { Alert, Button, Card, Progress } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiInformationCircle,
  HiPuzzle,
} from 'react-icons/hi'
import { SubgraphCreatedStep } from './steps/SubgraphCreatedStep'
import { SubgraphInfoStep } from './steps/SubgraphInfoStep'
import { SubgraphReviewStep } from './steps/SubgraphReviewStep'

interface SubgraphFormData {
  name: string
  displayName: string
  description: string
}

interface SubgraphCreationWizardProps {
  graphId: string
  parentGraphName?: string
  onCancel: () => void
  /** Fired when the user leaves the completion step, not at create time. */
  onSuccess: (subgraphId: string) => void
  className?: string
}

const steps = [
  {
    id: 'info',
    title: 'Subgraph Information',
    description: 'Configure your subgraph details',
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your configuration and create the subgraph',
  },
]

const COMPLETION_STEP = {
  title: 'Subgraph Created',
  description: 'Copy its id, or connect it to an MCP client',
}

export function SubgraphCreationWizard({
  graphId,
  parentGraphName,
  onCancel,
  onSuccess,
  className = '',
}: SubgraphCreationWizardProps) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [createdSubgraphId, setCreatedSubgraphId] = useState<string | null>(
    null
  )
  const [formData, setFormData] = useState<SubgraphFormData>({
    name: '',
    displayName: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      // Mirrors the API's own rule (CreateSubgraphRequest.validate_name):
      // alphanumeric only, 1-20 chars. Hyphens are rejected server-side
      // because the id parser splits parent from name on `_`.
      if (!formData.name.trim()) {
        newErrors.name = 'Subgraph name is required'
      } else if (!SUBGRAPH_NAME_PATTERN.test(formData.name)) {
        newErrors.name =
          'Name must be lowercase letters and numbers only — no hyphens, underscores, or spaces'
      } else if (formData.name.length > SUBGRAPH_NAME_MAX_LENGTH) {
        newErrors.name = `Name must be ${SUBGRAPH_NAME_MAX_LENGTH} characters or fewer`
      }

      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Display name is required'
      } else if (formData.displayName.length > 100) {
        newErrors.displayName = 'Display name must be less than 100 characters'
      }

      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description must be less than 500 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleCreate = async () => {
    if (!validateCurrentStep()) return

    setIsCreating(true)
    try {
      // Configure client
      client.setConfig({
        baseUrl:
          process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL ||
          'http://localhost:8000',
        credentials: 'include',
      })

      // Create the subgraph
      const response = await createSubgraph({
        client,
        path: {
          graph_id: graphId,
        },
        body: {
          name: formData.name,
          display_name: formData.displayName,
          description: formData.description || undefined,
        },
      })

      if (response.data) {
        // The non-fork path returns a completed envelope carrying the created
        // subgraph. Fall back to the id the API would have built anyway —
        // `{parent}_{name}` is deterministic — so the completion step always
        // has an address to show.
        const result = (
          response.data as { result?: { graph_id?: unknown } | null }
        ).result
        const subgraphId =
          typeof result?.graph_id === 'string'
            ? result.graph_id
            : subgraphIdFor(graphId, formData.name)

        showSuccess(`Subgraph "${formData.displayName}" created successfully`)
        setCreatedSubgraphId(subgraphId)
      }
    } catch (error: any) {
      console.error('Failed to create subgraph:', error)

      // Handle specific error cases
      if (error.status === 403) {
        showError(
          'Your current tier does not support subgraphs. Please upgrade.'
        )
      } else if (error.status === 409) {
        showError('A subgraph with this name already exists.')
        setErrors({ name: 'This name is already taken' })
        setCurrentStep(0)
      } else if (error.status === 400 || error.status === 422) {
        showError('Invalid subgraph configuration. Please check your inputs.')
        setCurrentStep(0)
      } else {
        showError(error.message || 'Failed to create subgraph')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const isComplete = createdSubgraphId !== null
  const progress = isComplete ? 100 : ((currentStep + 1) / steps.length) * 100
  const heading = isComplete ? COMPLETION_STEP : steps[currentStep]

  return (
    <div className={className}>
      <Card theme={customTheme.card} className="overflow-hidden">
        {/* Progress Header */}
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {isComplete
                  ? 'Complete'
                  : `Step ${currentStep + 1} of ${steps.length}`}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress
              progress={progress}
              size="sm"
              className="mt-2"
              theme={customTheme.progress}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {heading.title}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {heading.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {isComplete ? (
            <SubgraphCreatedStep
              subgraphId={createdSubgraphId}
              displayName={formData.displayName}
              parentGraphName={parentGraphName}
            />
          ) : currentStep === 0 ? (
            <SubgraphInfoStep
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              graphId={graphId}
            />
          ) : (
            <SubgraphReviewStep formData={formData} graphId={graphId} />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
          {isComplete ? (
            <>
              <Button
                color="gray"
                theme={customTheme.button}
                onClick={() => onSuccess(createdSubgraphId)}
              >
                Done
              </Button>
              <Button
                theme={customTheme.button}
                onClick={() =>
                  router.push(
                    `/connect?workspace=${encodeURIComponent(createdSubgraphId)}`
                  )
                }
              >
                <HiPuzzle className="mr-2 h-4 w-4" />
                Connect to MCP
              </Button>
            </>
          ) : (
            <>
              <div className="flex space-x-3">
                <Button
                  color="gray"
                  onClick={currentStep === 0 ? onCancel : handlePrevious}
                  theme={customTheme.button}
                  disabled={isCreating}
                >
                  {currentStep === 0 ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <HiArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </>
                  )}
                </Button>
              </div>

              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    theme={customTheme.button}
                    disabled={isCreating}
                  >
                    Next
                    <HiArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreate}
                    theme={customTheme.button}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <HiCheck className="mr-2 h-4 w-4" />
                        Create Subgraph
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Info Alert */}
      {!isComplete && (
        <Alert
          color="info"
          icon={HiInformationCircle}
          className="mt-6"
          theme={customTheme.alert}
        >
          <span className="font-medium">About Subgraphs:</span> Subgraphs are
          isolated graph environments within your main graph. Use them for AI
          memory and knowledge graphs, data workspaces with fork and publish
          workflows, or development and testing environments.
        </Alert>
      )}
    </div>
  )
}

export default SubgraphCreationWizard
