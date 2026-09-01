import type { AvailableExtension } from '@robosystems/client'
import { getAvailableExtensions } from '@robosystems/client'
import { customTheme } from '@robosystems/core'
import { Alert, Badge, Card, Checkbox, Spinner } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

interface SchemaExtensionsStepProps {
  selectedExtensions: string[]
  requiredExtensions: string[]
  allowedExtensions?: string[]
  onExtensionsChange: (extensions: string[]) => void
}

export function SchemaExtensionsStep({
  selectedExtensions,
  requiredExtensions,
  allowedExtensions,
  onExtensionsChange,
}: SchemaExtensionsStepProps) {
  const [allExtensions, setAllExtensions] = useState<AvailableExtension[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the full list once. The effect captures nothing from props, so its
  // empty dependency list is now accurate rather than suppressed.
  useEffect(() => {
    const fetchExtensions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getAvailableExtensions()
        if (response.data) {
          setAllExtensions(response.data.extensions)
        }
      } catch (err) {
        console.error('Failed to fetch extensions:', err)
        setError('Failed to load available extensions')
      } finally {
        setIsLoading(false)
      }
    }
    fetchExtensions()
  }, [])

  // Narrowing happens at render rather than being baked in at fetch time, so a
  // caller that changes allowedExtensions gets the right list without needing a
  // refetch — and without the prop having to be an effect dependency, which
  // would re-fetch on every parent render given it is passed as an array
  // literal.
  const extensions = allowedExtensions
    ? allExtensions.filter((ext) => allowedExtensions.includes(ext.name))
    : allExtensions

  const handleToggleExtension = (extensionName: string) => {
    // Don't allow deselecting required extensions
    if (requiredExtensions.includes(extensionName)) {
      return
    }

    if (selectedExtensions.includes(extensionName)) {
      onExtensionsChange(
        selectedExtensions.filter((ext) => ext !== extensionName)
      )
    } else {
      onExtensionsChange([...selectedExtensions, extensionName])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="xl" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading available extensions...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        <span className="font-medium">Error!</span> {error}
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {requiredExtensions.length > 0 && (
        <Alert color="info" icon={HiCheckCircle}>
          <span className="font-medium">Required Extensions:</span> The
          following extensions are required for this application and cannot be
          deselected: {requiredExtensions.join(', ')}
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {extensions.map((extension) => {
          const isRequired = requiredExtensions.includes(extension.name)
          const isSelected = selectedExtensions.includes(extension.name)

          return (
            <Card
              key={extension.name}
              theme={customTheme.card}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-primary-500 dark:ring-primary-400 ring-2'
                  : 'hover:shadow-md'
              } ${isRequired ? 'opacity-90' : ''}`}
              onClick={() =>
                !isRequired && handleToggleExtension(extension.name)
              }
            >
              <div className="flex flex-1 items-start">
                <Checkbox
                  theme={customTheme.checkbox}
                  checked={isSelected}
                  disabled={isRequired}
                  onChange={() => handleToggleExtension(extension.name)}
                  className="mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {extension.name}
                    </h4>
                    {isRequired && (
                      <Badge color="info" size="xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {extension.description ||
                      `Add ${extension.name} schema to your graph`}
                  </p>
                  {(extension as any).version && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Version: {(extension as any).version}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Selected Extensions:</strong>{' '}
          {selectedExtensions.length > 0
            ? selectedExtensions.join(', ')
            : 'None (base schema only)'}
        </p>
      </div>
    </div>
  )
}
