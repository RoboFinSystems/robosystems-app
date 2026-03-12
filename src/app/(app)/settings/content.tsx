'use client'

import type { User } from '@/lib/core'
import {
  ApiKeysCard,
  customTheme,
  GeneralInformationCard,
  PageLayout,
  PasswordInformationCard,
} from '@/lib/core'
import { useAuth } from '@/lib/core/auth-components'
import { Button } from 'flowbite-react'
import type { FC } from 'react'
import { useState } from 'react'
import { HiCog, HiMail } from 'react-icons/hi'

export interface UserProps {
  user: User
  onRefresh?: () => Promise<void>
}

const UserSettingsPageContent: FC<UserProps> = function ({ user, onRefresh }) {
  const { resendVerificationEmail } = useAuth()
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState(false)

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setResendError(false)
    try {
      const result = await resendVerificationEmail(user.email)
      if (result.success) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setResendError(true)
        setTimeout(() => setResendError(false), 5000)
      }
    } catch {
      setResendError(true)
      setTimeout(() => setResendError(false), 5000)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
          <HiCog className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            User Settings
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Manage your account, security, and API access
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {user.emailVerified === false && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiMail className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Email not verified
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {resendSuccess
                      ? 'Verification email sent! Check your inbox.'
                      : resendError
                        ? 'Failed to send verification email. Please try again.'
                        : 'Please verify your email address to secure your account.'}
                  </p>
                </div>
              </div>
              <Button
                size="xs"
                color="warning"
                onClick={handleResendVerification}
                disabled={resendLoading || resendSuccess}
              >
                {resendLoading
                  ? 'Sending...'
                  : resendSuccess
                    ? 'Sent'
                    : 'Resend Verification'}
              </Button>
            </div>
          </div>
        )}

        <GeneralInformationCard
          user={{
            ...user,
            name: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          theme={customTheme}
          onRefresh={onRefresh}
        />
        <PasswordInformationCard theme={customTheme} />
        <ApiKeysCard theme={customTheme} />
      </div>
    </PageLayout>
  )
}

export default UserSettingsPageContent
