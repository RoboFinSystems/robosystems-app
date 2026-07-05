'use client'

import { useAuth } from '@/lib/core/auth-components/AuthProvider'
import { AnimatedLogo, Spinner } from '@/lib/core/ui-components'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword, validateResetToken } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenEmail, setTokenEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const validateAttempted = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (validateAttempted.current) return
    validateAttempted.current = true

    const validate = async () => {
      if (!token) {
        setIsValidating(false)
        setStatus('error')
        setMessage('No reset token provided')
        return
      }

      try {
        const result = await validateResetToken(token)

        if (result.valid) {
          setTokenValid(true)
          setTokenEmail(result.email || '')
        } else {
          setStatus('error')
          setMessage(result.message || 'Invalid or expired reset token')
        }
      } catch {
        setStatus('error')
        setMessage('Failed to validate reset token')
      } finally {
        setIsValidating(false)
      }
    }

    validate()
  }, [token, validateResetToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    if (!token) {
      setStatus('error')
      setMessage('No reset token provided')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const result = await resetPassword(token, password)

      if (result.success) {
        setStatus('success')
        setMessage('Password reset successfully!')
        setTimeout(() => {
          router.push('/home')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.message || 'Failed to reset password')
      }
    } catch {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-900 to-zinc-800 p-6">
        <div className="text-center">
          <AnimatedLogo
            animate="loop"
            className="mx-auto h-16 w-16 text-white"
          />
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-900 to-zinc-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8 text-center">
          <HiExclamationCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="text-xl font-semibold tracking-tight text-gray-300">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-gray-400">
            {message || 'This password reset link is invalid or has expired.'}
          </p>
          <a
            href="/auth/forgot-password"
            className="inline-block rounded-md bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100"
          >
            Request new reset link
          </a>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-900 to-zinc-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-6 text-center">
          <HiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold tracking-tight text-gray-300">
            Password Reset!
          </h2>
          <p className="text-sm text-gray-400">{message}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-900 to-zinc-800 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <AnimatedLogo
            animate="once"
            className="mx-auto h-14 w-14 text-white"
          />
          <h2 className="mt-6 text-center text-xl font-semibold tracking-tight text-gray-300">
            Reset your password
          </h2>
          {tokenEmail && (
            <p className="mt-2 text-sm text-gray-400">For {tokenEmail}</p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {status === 'error' && (
            <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
              <div className="text-sm text-red-300">{message}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-white focus:ring-inset"
                placeholder="New password"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-white focus:ring-inset"
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Spinner size="sm" className="mr-2 text-black" />}
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Back to sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-900 to-zinc-800 p-6">
          <div className="text-center">
            <AnimatedLogo
              animate="loop"
              className="mx-auto h-16 w-16 text-white"
            />
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
