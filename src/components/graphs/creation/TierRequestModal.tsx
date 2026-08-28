'use client'

import { useOrg, useUser } from '@robosystems/core'
import { customTheme } from '@robosystems/core/theme'
import { Modal } from 'flowbite-react'
import TierRequestForm, { type TierRequestTarget } from './TierRequestForm'

interface TierRequestModalProps {
  isOpen: boolean
  onClose: () => void
  target: TierRequestTarget | null
  /**
   * The entry tier fills up; the larger tiers are provisioned on request.
   * Same button, different story.
   */
  isEntryTier?: boolean
}

export default function TierRequestModal({
  isOpen,
  onClose,
  target,
  isEntryTier = false,
}: TierRequestModalProps) {
  const { user } = useUser()
  const { currentOrg } = useOrg()

  if (!target) {
    return null
  }

  const description = isEntryTier
    ? `${target.displayName} is currently full. Tell us a little about what you're bringing in and we'll get you a slot.`
    : `Standard is the starting point. Larger tiers are set up on request for bigger ledgers, more entities, and heavier usage. Tell us what you're bringing in and we'll get ${target.displayName} provisioned for you.`

  return (
    <Modal show={isOpen} onClose={onClose} size="2xl" theme={customTheme.modal}>
      <div className="relative rounded-lg border border-gray-700 bg-gradient-to-br from-zinc-900 to-zinc-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold text-white">
              Request access to {target.displayName}
            </h3>
            <p className="text-gray-300">{description}</p>
          </div>

          <TierRequestForm
            target={target}
            onClose={onClose}
            userName={user?.name}
            userEmail={user?.email}
            orgName={currentOrg?.name}
            orgId={currentOrg?.id}
          />
        </div>
      </div>
    </Modal>
  )
}
