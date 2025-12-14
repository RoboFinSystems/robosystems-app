import { useToast } from '@/lib/core'
import { useCallback } from 'react'

interface ApiError {
  detail?: string
  message?: string
  code?: string
  status?: number
}

export function useApiError() {
  const { showError } = useToast()

  const handleApiError = useCallback(
    (error: unknown, defaultMessage?: string) => {
      console.error('API Error:', error)

      let errorMessage = defaultMessage || 'An error occurred'

      if (error instanceof Error) {
        // Check if it's an API response error
        const apiError = error as any

        if (apiError.response?.data) {
          const data = apiError.response.data as ApiError
          errorMessage = data.detail || data.message || errorMessage

          // Handle specific error codes
          if (apiError.response.status === 402) {
            errorMessage = 'Insufficient credits for this operation'
          } else if (apiError.response.status === 429) {
            errorMessage = 'Too many requests. Please try again later.'
          } else if (apiError.response.status === 403) {
            errorMessage = 'You do not have permission to perform this action'
          }
        } else if (apiError.detail) {
          errorMessage = apiError.detail
        } else if (error.message) {
          // Network errors or other JS errors
          if (error.message.includes('Network')) {
            errorMessage = 'Network error. Please check your connection.'
          } else {
            errorMessage = error.message
          }
        }
      }

      showError(errorMessage)
      return errorMessage
    },
    [showError]
  )

  return { handleApiError }
}
