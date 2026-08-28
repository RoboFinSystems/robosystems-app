'use client'

import { API_ENDPOINTS } from '@/lib/config/api'
import { isTurnstileEnabled, isTurnstileValid } from '@/lib/config/turnstile'
import {
  TurnstileWidget,
  type TurnstileWidgetRef,
} from '@robosystems/core/auth-components/TurnstileWidget'
import { Button, Label, TextInput, Textarea } from 'flowbite-react'
import { useRef, useState } from 'react'

/** The tier a prospect is asking for, as the picker knows it. */
export interface TierRequestTarget {
  tier: string
  displayName: string
  monthlyPrice?: number | null
  capacityStatus?: string
}

interface TierRequestFormProps {
  target: TierRequestTarget
  onClose: () => void
  userName?: string
  userEmail?: string
  orgName?: string
  orgId?: string
}

export function buildTierRequestMessage(
  target: TierRequestTarget,
  orgId: string | undefined,
  workload: string
): string {
  const price =
    target.monthlyPrice != null ? ` — $${target.monthlyPrice}/month` : ''
  return `[TIER ACCESS REQUEST]
Tier: ${target.displayName} (${target.tier})${price}
Capacity status: ${target.capacityStatus || 'unknown'}
Org ID: ${orgId || 'Not available'}
Workload: ${workload.trim() || 'Not provided'}`
}

/**
 * The request that turns a greyed-out tier card into a lead. Same shape as
 * the graph-limit request one step earlier in the wizard: the account
 * details are prefilled from the session, the prospect adds what they are
 * bringing in, and the whole thing lands in the contact-form SNS topic
 * tagged `tier-request`. The contact route requires a Turnstile token in
 * production, which is why this is a form and not a one-click POST.
 */
export default function TierRequestForm({
  target,
  onClose,
  userName = '',
  userEmail = '',
  orgName = '',
  orgId,
}: TierRequestFormProps) {
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    company: orgName,
    workload: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetRef>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetCaptcha = () => {
    if (turnstileRef.current) {
      turnstileRef.current.reset()
      setCaptchaToken(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isTurnstileValid(captchaToken)) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: buildTierRequestMessage(target, orgId, formData.workload),
          type: 'tier-request',
          captchaToken: captchaToken,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
        }, 2500)
      } else {
        if (process.env.NODE_ENV === 'development') {
          const error = await response.json()
          console.error('Tier request error:', error)
        }
        setSubmitStatus('error')
        resetCaptcha()
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Tier request error:', error)
      }
      setSubmitStatus('error')
      resetCaptcha()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="py-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">Request received</h3>
        <p className="text-gray-300">
          We&apos;ll reach out at {formData.email} to get the{' '}
          {target.displayName} tier set up for you.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="tier-request-name" className="mb-2 block text-white">
          Full Name *
        </Label>
        <TextInput
          id="tier-request-name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
          value={formData.name}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      <div>
        <Label htmlFor="tier-request-email" className="mb-2 block text-white">
          Email *
        </Label>
        <TextInput
          id="tier-request-email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      <div>
        <Label htmlFor="tier-request-company" className="mb-2 block text-white">
          Company *
        </Label>
        <TextInput
          id="tier-request-company"
          name="company"
          type="text"
          required
          placeholder="Acme Inc."
          value={formData.company}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      <div>
        <Label
          htmlFor="tier-request-workload"
          className="mb-2 block text-white"
        >
          What are you bringing in?
        </Label>
        <Textarea
          id="tier-request-workload"
          name="workload"
          rows={4}
          placeholder="Ledger size, number of entities, expected usage — anything that helps us size it right."
          value={formData.workload}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      {isTurnstileEnabled() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center">
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
            onExpire={() => setCaptchaToken(null)}
            theme="dark"
            disabled={isSubmitting}
          />
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="text-sm text-red-500">
          {!isTurnstileValid(captchaToken)
            ? 'Please complete the security verification.'
            : 'Something went wrong. Please try again later.'}
        </div>
      )}

      <div className="flex gap-3 pt-4 pb-8">
        <Button
          type="submit"
          disabled={isSubmitting || !isTurnstileValid(captchaToken)}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          {isSubmitting ? 'Submitting...' : 'Request access'}
        </Button>
        <Button
          type="button"
          color="gray"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
