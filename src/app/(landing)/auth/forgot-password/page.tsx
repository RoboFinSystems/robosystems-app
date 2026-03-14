'use client'

import { useAuth } from '@/lib/core/auth-components/AuthProvider'
import { AnimatedLogo, Spinner } from '@/lib/core/ui-components'
import { useState } from 'react'
import { HiCheckCircle } from 'react-icons/hi'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const result = await forgotPassword(email)

      if (result.success) {
        setStatus('success')
        setMessage(
          'If an account exists with this email, you will receive a password reset link shortly.'
        )
        setEmail('')
      } else {
        setStatus('error')
        setMessage(result.message || 'Failed to send reset email')
      }
    } catch {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6 text-center">
            <HiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <p className="text-sm text-gray-300">{message}</p>
            <a
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="rounded-md border border-red-800 bg-red-900/50 p-4">
                <div className="text-sm text-red-300">{message}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full rounded-md border-0 bg-gray-800 px-5 py-4 text-base leading-7 text-white ring-1 ring-gray-600 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-white focus:ring-inset"
                  placeholder="Email address"
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
                {loading && <Spinner size="sm" className="mr-2 border-black" />}
                {loading ? 'Sending...' : 'Send reset link'}
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
        )}
      </div>
    </div>
  )
}
