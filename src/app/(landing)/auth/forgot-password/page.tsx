'use client'

import { useAuth } from '@/lib/core/auth-components/AuthProvider'
import { Alert, Button, TextInput } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HiArrowLeft, HiMail } from 'react-icons/hi'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const result = await forgotPassword(email)

      if (result.success) {
        setStatus('success')
        setMessage(
          'If an account exists with this email, you will receive a password reset link shortly.'
        )
        // Clear the form
        setEmail('')
      } else {
        setStatus('error')
        setMessage(result.message || 'Failed to send reset email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Forgot Password?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {status === 'success' && (
            <Alert color="success" className="mb-6">
              <span className="font-medium">Success!</span> {message}
            </Alert>
          )}

          {status === 'error' && (
            <Alert color="failure" className="mb-6">
              <span className="font-medium">Error!</span> {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
