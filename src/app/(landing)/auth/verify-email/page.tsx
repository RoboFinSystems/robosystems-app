'use client'

import { loginPathWith } from '@/components/auth/return-to'
import { useAuth } from '@robosystems/core/auth-components/AuthProvider'
import { Spinner } from 'flowbite-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState<string>('')
  const [redirectTo, setRedirectTo] = useState<string>('/home')
  const verifyAttempted = useRef(false)

  // Verify the token exactly once. Re-runs (a dependency identity change, or a
  // Strict Mode remount) are guarded so we never double-verify. Deliberately
  // does NOT schedule the redirect — that lives in the separate effect below.
  useEffect(() => {
    if (verifyAttempted.current) return
    verifyAttempted.current = true

    const verifyEmailToken = async () => {
      const token = searchParams.get('token')
      // Email links carry the app the user came from (backend appends it
      // when the login-home email flag is on); post-verify routing bridges
      // onward via /login.
      const rawReturnTo = searchParams.get('return_to')

      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setRedirectTo(rawReturnTo ? loginPathWith(rawReturnTo) : '/home')
          setMessage(result.message || 'Email verified successfully!')
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(result.message || 'Failed to verify email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred during verification')
      }
    }

    verifyEmailToken()
  }, [searchParams, verifyEmail])

  // Redirect after a successful verification, in its own effect keyed on
  // `status`. Keeping this out of the verification effect is the fix for a
  // stranded-on-success bug: when the redirect timeout lived in the verify
  // effect, an unrelated re-render (e.g. the auth context updating `verifyEmail`
  // right after verification) re-ran that effect, whose cleanup cleared the
  // pending timeout while the ref-guard skipped rescheduling it — so the
  // redirect never fired. Here the timeout is only ever cleared alongside a
  // re-schedule (or on unmount), so a successful verify always redirects.
  useEffect(() => {
    if (status !== 'success') return

    const timeoutId = setTimeout(() => {
      router.push(redirectTo)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [status, redirectTo, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Spinner size="xl" className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verifying Your Email
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <HiCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Email Verified!
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <HiExclamationCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
              <div className="mt-6">
                <button
                  onClick={() =>
                    router.push(loginPathWith(searchParams.get('return_to')))
                  }
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md space-y-8 p-6">
            <div className="text-center">
              <Spinner size="xl" className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
