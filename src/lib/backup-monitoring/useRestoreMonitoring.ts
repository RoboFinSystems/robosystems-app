/**
 * Enhanced restore monitoring hook that combines task monitoring with detailed restore progress tracking.
 *
 * This hook provides both the standard task monitoring (for compatibility) and detailed restore progress
 * from the Valkey-backed progress tracking system that persists beyond standard task timeouts.
 */

import { useCallback, useRef, useState } from 'react'

// TODO: Import getRestoreProgress when available in SDK
// import { getRestoreProgress } from '@robosystems/client'
import { useTaskMonitoring } from '@/lib/core/task-monitoring'

// TODO: Import RestoreProgressResponse type when available in SDK
// import type { RestoreProgressResponse } from '@robosystems/client'
type RestoreProgressResponse = any

export interface RestoreMonitoringState {
  restoreProgress: RestoreProgressResponse | null
  isPollingProgress: boolean
  progressError: string | null
}

export function useRestoreMonitoring() {
  const taskMonitor = useTaskMonitoring()
  const [restoreProgress, setRestoreProgress] =
    useState<RestoreProgressResponse | null>(null)
  const [isPollingProgress, setIsPollingProgress] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearProgressPolling = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setIsPollingProgress(false)
  }, [])

  const startProgressPolling = useCallback(
    async (backupId: string, graphId: string) => {
      setIsPollingProgress(true)
      setProgressError(null)

      const pollProgress = async () => {
        try {
          // TODO: Uncomment when getRestoreProgress is available in SDK
          // const response = await getRestoreProgress({
          //   path: { backup_id: backupId, graph_id: graphId },
          // })
          // if (response.data) {
          //   setRestoreProgress(response.data)
          //   setProgressError(null)
          //   // Stop polling if restore is completed or failed
          //   if (
          //     response.data.status === 'completed' ||
          //     response.data.status === 'failed' ||
          //     response.data.progress >= 100
          //   ) {
          //     clearProgressPolling()
          //   }
          // }
        } catch (error: any) {
          // Handle different error scenarios
          if (error?.status === 404) {
            // No restore in progress - this is expected when restore completes
            clearProgressPolling()
          } else {
            console.warn('Restore progress polling error:', error)
            setProgressError(
              error?.message || 'Failed to fetch restore progress'
            )
            // Stop polling on persistent errors
            clearProgressPolling()
          }
        }
      }

      // Initial poll
      await pollProgress()

      // Set up interval polling (every 3 seconds for detailed progress)
      progressIntervalRef.current = setInterval(pollProgress, 3000)
    },
    [clearProgressPolling]
  )

  const startRestoreMonitoring = useCallback(
    async (taskId: string, backupId: string, graphId: string) => {
      // Start both task monitoring and restore progress polling
      // Use extended timeout for restore operations (60 minutes = 1800 attempts at 2s intervals)
      const taskPromise = taskMonitor.startMonitoring(taskId, {
        maxAttempts: 1800, // 60 minutes at 2s intervals
        pollInterval: 2000,
      })

      // Start detailed progress polling
      await startProgressPolling(backupId, graphId)

      // Clean up progress polling when task monitoring completes
      return taskPromise.finally(() => {
        clearProgressPolling()
      })
    },
    [taskMonitor, startProgressPolling, clearProgressPolling]
  )

  const stopRestoreMonitoring = useCallback(() => {
    // Reset task monitoring state
    taskMonitor.reset()
    clearProgressPolling()
    setRestoreProgress(null)
    setProgressError(null)
  }, [taskMonitor, clearProgressPolling])

  const resetRestoreMonitoring = useCallback(() => {
    taskMonitor.reset()
    clearProgressPolling()
    setRestoreProgress(null)
    setProgressError(null)
  }, [taskMonitor, clearProgressPolling])

  // Enhanced progress information with safe fallbacks
  const enhancedProgress =
    restoreProgress?.progress ?? taskMonitor.progress ?? 0
  const enhancedMessage =
    restoreProgress?.message ?? taskMonitor.currentStep ?? 'Initializing...'
  const enhancedStep = restoreProgress?.step ?? 'initialization'
  const enhancedStatus =
    restoreProgress?.status ?? (taskMonitor.isLoading ? 'starting' : 'unknown')

  return {
    // Task monitoring properties (for compatibility)
    ...taskMonitor,

    // Enhanced restore progress properties
    restoreProgress,
    isPollingProgress,
    progressError,

    // Enhanced computed properties
    enhancedProgress,
    enhancedMessage,
    enhancedStep,
    enhancedStatus,

    // Enhanced methods
    startRestoreMonitoring,
    stopRestoreMonitoring,
    resetRestoreMonitoring,
    startProgressPolling,
    clearProgressPolling,
  }
}

export type UseRestoreMonitoringReturn = ReturnType<typeof useRestoreMonitoring>
