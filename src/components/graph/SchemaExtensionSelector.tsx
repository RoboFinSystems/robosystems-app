import type { AvailableExtension } from '@robosystems/client'
import { getAvailableExtensions } from '@robosystems/client'
import { Alert, Spinner } from 'flowbite-react'
import { useEffect, useState, type FC } from 'react'
import { HiExclamationCircle } from 'react-icons/hi'

interface SchemaExtensionSelectorProps {
  selectedExtensions: string[]
  onExtensionsChange: (extensions: string[]) => void
  disabled?: boolean
}

const SchemaExtensionSelector: FC<SchemaExtensionSelectorProps> = ({
  selectedExtensions,
  onExtensionsChange,
  disabled = false,
}) => {
  const [extensions, setExtensions] = useState<AvailableExtension[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExtensions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await getAvailableExtensions()
        if (response.data) {
          setExtensions(response.data.extensions)
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

  if (error) {
    return (
      <Alert color="failure">
        <HiExclamationCircle className="h-4 w-4" />
        <span className="font-medium">Error!</span> {error}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loading available extensions...
        </span>
      </div>
    )
  }

  if (extensions.length === 0) {
    return (
      <Alert color="info">
        <span className="font-medium">No extensions available</span>
        <p className="text-sm">
          The graph will be created with the base RoboSystems schema only.
        </p>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {extensions.map((ext) => {
        const isSelected = selectedExtensions.includes(ext.name)
        return (
          <div
            key={ext.name}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => {
              if (disabled) return
              onExtensionsChange(
                isSelected
                  ? selectedExtensions.filter((e) => e !== ext.name)
                  : [...selectedExtensions, ext.name]
              )
            }}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onExtensionsChange(
                  isSelected
                    ? selectedExtensions.filter((e) => e !== ext.name)
                    : [...selectedExtensions, ext.name]
                )
              }
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                disabled={disabled}
                className="mt-1"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {ext.name}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {ext.description}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {/* Node and relationship counts not available in current API */}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SchemaExtensionSelector
