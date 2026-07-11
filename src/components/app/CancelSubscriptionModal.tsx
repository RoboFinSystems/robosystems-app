'use client'

import { customTheme } from '@robosystems/core'
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Radio,
  TextInput,
} from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HiExclamationCircle, HiInformationCircle } from 'react-icons/hi'

export type CancelMode = 'period_end' | 'immediate'

export interface CancelSubscriptionModalProps {
  /** Whether the modal is visible */
  show: boolean
  /** Close handler — called when user dismisses or cancels */
  onClose: () => void
  /** Submit handler — receives the chosen mode */
  onConfirm: (mode: CancelMode) => Promise<void> | void
  /** Whether a cancel operation is in flight (locks the modal) */
  loading?: boolean

  /** "graph" or "repository" — drives copy and the resource label */
  resourceType: 'graph' | 'repository'
  /** Human-readable name shown to the user (e.g. "My Customer DB" or "SEC") */
  resourceName: string
  /** Canonical resource_id — must be typed by the user to confirm immediate */
  resourceId: string
  /** Optional plan/billing details shown for context */
  planLabel?: string
  priceCents?: number
  billingInterval?: string
  /** ISO timestamp shown for the period_end option */
  currentPeriodEnd?: string | null
}

/**
 * Two-mode subscription cancellation modal.
 *
 * - **Period end** (default): preserves access through the paid period; the
 *   resource is torn down at the period boundary by the existing sensor
 *   pipeline.
 * - **Immediate**: cancels now and triggers fast-path teardown (~10 minutes
 *   for graphs). For repositories, immediate just stops billing access; for
 *   graphs, the data is destroyed.
 *
 * The user must type the `resourceId` to confirm immediate — same algorithmic
 * confirm the API enforces, so the UI can't drift from the backend rule.
 */
export default function CancelSubscriptionModal({
  show,
  onClose,
  onConfirm,
  loading = false,
  resourceType,
  resourceName,
  resourceId,
  planLabel,
  priceCents,
  billingInterval,
  currentPeriodEnd,
}: CancelSubscriptionModalProps) {
  const [mode, setMode] = useState<CancelMode>('period_end')
  const [confirmText, setConfirmText] = useState('')

  // Reset state whenever the modal is opened so previous attempts don't bleed in.
  useEffect(() => {
    if (show) {
      setMode('period_end')
      setConfirmText('')
    }
  }, [show])

  const confirmMatches = confirmText.trim() === resourceId
  const isImmediate = mode === 'immediate'
  // Confirm-by-typing is required only for immediate (matches backend);
  // period-end is gentler — same friction would just annoy users.
  const submitDisabled = loading || (isImmediate && !confirmMatches)

  const handleClose = () => {
    if (!loading) onClose()
  }

  const handleSubmit = async () => {
    if (submitDisabled) return
    await onConfirm(mode)
  }

  const isGraph = resourceType === 'graph'
  const destructiveLabel = isGraph ? 'Delete Graph Now' : 'Cancel Now'
  const destructiveExplain = isGraph
    ? 'Subscription is canceled immediately. The graph database is torn down within ~10 minutes — data cannot be recovered without a backup.'
    : 'Subscription is canceled immediately. Access to the repository ends now; remaining paid time is forfeited.'

  return (
    <Modal
      show={show}
      onClose={handleClose}
      size="lg"
      theme={customTheme.modal}
    >
      <ModalHeader>
        {isGraph ? 'Delete Graph' : 'Cancel Repository Subscription'}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <HiExclamationCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isGraph
                  ? `Delete ${resourceName}?`
                  : `Cancel your ${resourceName} subscription?`}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-mono text-xs text-gray-500 dark:text-gray-500">
                  {resourceId}
                </p>
                {planLabel && <p>{planLabel}</p>}
                {priceCents !== undefined && (
                  <p>
                    ${(priceCents / 100).toFixed(2)}
                    {billingInterval ? `/${billingInterval}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              When should this happen?
            </legend>

            {/* Wrap each row in a native <label htmlFor> so the entire row
                is clickable via standard HTML semantics — no role hack
                needed, screen readers see a real label associated with the
                radio. */}
            <label
              htmlFor="cancel-mode-period-end"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            >
              <Radio
                id="cancel-mode-period-end"
                name="cancel-mode"
                value="period_end"
                checked={mode === 'period_end'}
                onChange={() => setMode('period_end')}
                disabled={loading}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  At end of billing period{' '}
                  <span className="ml-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    Recommended
                  </span>
                </span>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Keep access until
                  {currentPeriodEnd
                    ? ` ${new Date(currentPeriodEnd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.`
                    : ' the end of your current period.'}{' '}
                  {isGraph
                    ? 'The graph stays usable through the period; teardown runs automatically when it ends.'
                    : 'Repository access stays active through the period.'}
                </p>
              </div>
            </label>

            <label
              htmlFor="cancel-mode-immediate"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-red-300 dark:border-gray-700 dark:hover:border-red-700"
            >
              <Radio
                id="cancel-mode-immediate"
                name="cancel-mode"
                value="immediate"
                checked={mode === 'immediate'}
                onChange={() => setMode('immediate')}
                disabled={loading}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  {destructiveLabel}
                </span>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {destructiveExplain}
                </p>
              </div>
            </label>
          </fieldset>

          {isImmediate && (
            <div className="space-y-2">
              <Alert color="warning" icon={HiInformationCircle}>
                <p className="text-sm">
                  Type{' '}
                  <span className="font-mono font-semibold">{resourceId}</span>{' '}
                  below to confirm
                  {isGraph ? ' deletion.' : ' immediate cancellation.'}
                </p>
              </Alert>
              <TextInput
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={resourceId}
                disabled={loading}
                aria-label="Confirm by typing resource id"
              />
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex w-full gap-3">
          <Button
            color="gray"
            onClick={handleClose}
            disabled={loading}
            theme={customTheme.button}
            className="flex-1"
          >
            Keep Subscription
          </Button>
          <Button
            color="failure"
            onClick={handleSubmit}
            disabled={submitDisabled}
            theme={customTheme.button}
            className="flex-1"
          >
            {loading
              ? 'Cancelling…'
              : isImmediate
                ? destructiveLabel
                : 'Cancel at Period End'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}
