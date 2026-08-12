'use client'

import { SignUpForm } from '@/components/auth/SignUpForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const searchParams = useSearchParams()

  // Organization invitations link here as /register?invite=<token>. The form
  // resolves the token itself and joins the inviting organization instead of
  // creating a personal one.
  const inviteToken = searchParams.get('invite') || undefined

  return (
    <SignUpForm
      apiUrl={
        process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'http://localhost:8000'
      }
      showConfirmPassword={true}
      showTermsAcceptance={true}
      redirectTo="/login"
      inviteToken={inviteToken}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  )
}

export default function RegisterContent() {
  // useSearchParams needs a Suspense boundary, or the whole route opts out of
  // static rendering.
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
