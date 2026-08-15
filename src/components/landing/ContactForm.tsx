'use client'

import { isTurnstileEnabled, isTurnstileValid } from '@/lib/config/turnstile'
import {
  TurnstileWidget,
  type TurnstileWidgetRef,
} from '@robosystems/core/auth-components/TurnstileWidget'
import { Button, Label, TextInput, Textarea } from 'flowbite-react'
import { useRef, useState } from 'react'

interface ContactFormProps {
  onClose: () => void
  formType?: string
}

interface FormCopy {
  messageLabel: string
  placeholder: string
  success: string
}

/**
 * Field and confirmation copy by intent. The default is the developer /
 * integration ask the modal was built for; `sales` covers every "Contact
 * Sales" and Dedicated Deployment entry point, so a buyer is asked about
 * their organization rather than which systems they need to integrate.
 */
const FORM_COPY: Record<'default' | 'inquiry' | 'sales', FormCopy> = {
  default: {
    messageLabel: 'Tell us about your integration needs',
    placeholder:
      'What systems do you need to integrate? What data needs to flow between them?',
    success: 'Our integration team will get back to you within 24 hours.',
  },
  inquiry: {
    messageLabel: 'Your Message',
    placeholder: 'Please describe your question or concern...',
    success:
      "We'll review your message and get back to you as soon as possible.",
  },
  sales: {
    messageLabel: 'Tell us about your organization',
    placeholder:
      'How many entities or clients? Which identity provider? Any residency, procurement, or isolation requirements?',
    success: "Thanks — we'll get back to you within one business day.",
  },
}

export function copyForFormType(formType: string): FormCopy {
  if (formType === 'terms-inquiry' || formType === 'privacy-inquiry') {
    return FORM_COPY.inquiry
  }
  if (formType === 'sales' || formType === 'dedicated_deployment') {
    return FORM_COPY.sales
  }
  return FORM_COPY.default
}

export default function ContactForm({
  onClose,
  formType = 'general',
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetRef>(null)
  const copy = copyForFormType(formType)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if CAPTCHA is required and not completed
    if (!isTurnstileValid(captchaToken)) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: formType,
          captchaToken: captchaToken,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const error = await response.json()
        console.error('Contact form error:', error)
        setSubmitStatus('error')

        // Reset CAPTCHA on error
        if (turnstileRef.current) {
          turnstileRef.current.reset()
          setCaptchaToken(null)
        }
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')

      // Reset CAPTCHA on error
      if (turnstileRef.current) {
        turnstileRef.current.reset()
        setCaptchaToken(null)
      }
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
        <h3 className="mb-2 text-2xl font-bold text-white">Message Sent!</h3>
        <p className="text-gray-300">{copy.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="mb-2 block text-white">
          Name
        </Label>
        <TextInput
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      <div>
        <Label htmlFor="email" className="mb-2 block text-white">
          Email
        </Label>
        <TextInput
          id="email"
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
        <Label htmlFor="company" className="mb-2 block text-white">
          Company
        </Label>
        <TextInput
          id="company"
          name="company"
          type="text"
          required
          value={formData.company}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      <div>
        <Label htmlFor="message" className="mb-2 block text-white">
          {copy.messageLabel}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder={copy.placeholder}
          value={formData.message}
          onChange={handleInputChange}
          className="border-gray-700 bg-zinc-800 text-white"
        />
      </div>

      {/* Turnstile CAPTCHA Widget */}
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
          className="bg-secondary-600 hover:bg-secondary-700 flex-1"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
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
