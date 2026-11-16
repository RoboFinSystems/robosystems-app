'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'

/**
 * The line under a "Book 20 minutes" button. The public scheduler is open Thursday and
 * Friday afternoons only, on purpose, so every closing ask offers the contact form as the
 * other way in.
 */
export default function EmailForATime({
  className = 'mt-4 text-sm text-gray-400',
}: {
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <p className={className}>
        Thursday or Friday afternoon not good?{' '}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-secondary-400 hover:text-secondary-300 underline underline-offset-2"
        >
          Email us
        </button>{' '}
        and we&apos;ll find a time.
      </p>
      <ContactModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Find a time"
        description="Tell us which job you have and a few times that suit you. We'll reply by email."
        formType="meeting"
      />
    </>
  )
}
