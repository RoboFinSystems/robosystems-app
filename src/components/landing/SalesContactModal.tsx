'use client'

import ContactModal from './ContactModal'

/**
 * The one contact modal every sales entry point opens.
 *
 * "Contact Sales" used to open the developer/integration modal — a Dedicated
 * Deployment buyer was asked which systems they needed to integrate and told
 * the integration team would reply. This keeps the sales copy in one place so
 * the pricing page, the deployment-options page and the homepage all ask the
 * same question and route the same `formType` to SNS.
 */
export type SalesContactVariant = 'sales' | 'dedicated_deployment'

const VARIANTS: Record<
  SalesContactVariant,
  { title: string; description: string }
> = {
  sales: {
    title: 'Talk to sales',
    description:
      'Questions about plans, procurement, or a Dedicated Deployment? Tell us a little about your organization and we will come back with answers, not a sales deck.',
  },
  dedicated_deployment: {
    title: 'Talk to us about a Dedicated Deployment',
    description:
      'Tell us a little about your organization and we will come back with a scoping conversation, not a sales deck.',
  },
}

interface SalesContactModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: SalesContactVariant
}

export default function SalesContactModal({
  isOpen,
  onClose,
  variant = 'sales',
}: SalesContactModalProps) {
  const copy = VARIANTS[variant]
  return (
    <ContactModal
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      formType={variant}
    />
  )
}
