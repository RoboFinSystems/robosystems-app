'use client'

import { cancelOperation, getOperationStatus } from '@robosystems/client'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface TaskMonitorState {
  isLoading: boolean
  progress: number | null
  currentStep: string | null
  error: string | null
  taskId: string | null
  result: any
}

export interface UseTaskMonitoringResult extends TaskMonitorState {
  startMonitoring: (
    taskId: string,
    options?: { maxAttempts?: number; pollInterval?: number }
  ) => Promise<any>
  cancelCurrentTask: () => Promise<void>
  reset: () => void
}

export function useTaskMonitoring(): UseTaskMonitoringResult {
  const [state, setState] = useState<TaskMonitorState>({
    isLoading: false,
    progress: null,
    currentStep: null,
    error: null,
    taskId: null,
    result: null,
  })

  const currentTaskId = useRef<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: null,
      currentStep: null,
      error: null,
      taskId: null,
      result: null,
    })
    currentTaskId.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const cancelCurrentTask = useCallback(async () => {
    if (currentTaskId.current) {
      try {
        await cancelOperation({ path: { operation_id: currentTaskId.current } })
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Task was cancelled',
          result: null,
        }))
      } catch (error) {
        console.error('Failed to cancel task:', error)
        setState((prev) => ({
          ...prev,
          error: 'Failed to cancel task',
          result: null,
        }))
      }
    }
  }, [])

  const startMonitoring = useCallback(
    async (
      taskId: string,
      options?: { maxAttempts?: number; pollInterval?: number }
    ) => {
      const maxAttempts = options?.maxAttempts || 120 // 4 minutes with 2s interval
      const pollInterval = options?.pollInterval || 2000

      currentTaskId.current = taskId
      setState({
        isLoading: true,
        progress: null,
        currentStep: null,
        error: null,
        taskId,
        result: null,
      })

      return new Promise((resolve, reject) => {
        let attempts = 0

        const checkStatus = async () => {
          try {
            attempts++
            const response = await getOperationStatus({
              path: { operation_id: taskId },
            })

            if (!response.data) {
              throw new Error('No response data')
            }

            const status = response.data

            // Update state with current status
            setState((prev) => ({
              ...prev,
              progress: (status.progress as number) || null,
              currentStep: (status.step ||
                status.message ||
                'Processing...') as string,
            }))

            // Log status for debugging
            console.log(
              'Task status:',
              status.status,
              'Progress:',
              status.progress,
              'Full response:',
              status
            )

            switch (status.status) {
              case 'completed':
                // Task completed successfully
                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                  progress: 100,
                  currentStep: 'Completed',
                  result: status.result || status.details || status,
                }))

                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }

                resolve(status.result || status.details || status)
                break

              case 'failed': {
                // Task failed
                const errorMsg = (status.error ||
                  status.message ||
                  'Task failed') as string
                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                  error: errorMsg,
                  result: null,
                }))

                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }

                reject(new Error(errorMsg as string))
                break
              }

              case 'cancelled': {
                // Task was cancelled
                const errorMsg = 'Task was cancelled'
                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                  error: errorMsg,
                  result: null,
                }))

                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                  intervalRef.current = null
                }

                reject(new Error(errorMsg as string))
                break
              }

              case 'pending':
              case 'in_progress':
              case 'retrying':
                // Continue polling
                if (attempts >= maxAttempts) {
                  // Timeout
                  const errorMsg = 'Task monitoring timed out'
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: errorMsg,
                    result: null,
                  }))

                  if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                  }

                  reject(new Error(errorMsg as string))
                }
                // Otherwise continue polling
                break

              default:
                // Unknown status - log it and continue polling
                console.warn('Unknown task status:', status.status)
                if (attempts >= maxAttempts) {
                  const errorMsg = `Unknown task status: ${status.status}`
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: errorMsg,
                    result: null,
                  }))

                  if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                  }

                  reject(new Error(errorMsg as string))
                }
            }
          } catch (error) {
            console.error('Error checking task status:', error)

            if (attempts >= maxAttempts) {
              const errorMsg =
                error instanceof Error ? error.message : 'Unknown error'
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: errorMsg,
                result: null,
              }))

              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }

              reject(error)
            }
          }
        }

        // Initial check
        checkStatus()

        // Set up polling interval
        intervalRef.current = setInterval(checkStatus, pollInterval)
      })
    },
    []
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (currentTaskId.current) {
        cancelOperation({
          path: { operation_id: currentTaskId.current },
        }).catch(() => {})
      }
    }
  }, [])

  return {
    ...state,
    startMonitoring,
    cancelCurrentTask,
    reset,
  }
}
