'use client'

import { SignInForm } from '@/components/auth/SignInForm'

export default function LoginContent() {
  return (
    <SignInForm
      apiUrl={
        process.env.NEXT_PUBLIC_ROBOSYSTEMS_API_URL || 'http://localhost:8000'
      }
      redirectTo="/home"
    />
  )
}
