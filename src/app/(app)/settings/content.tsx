'use client'

import type { User } from '@/lib/core'
import {
  ApiKeysCard,
  customTheme,
  GeneralInformationCard,
  PageLayout,
  PasswordInformationCard,
} from '@/lib/core'
import type { FC } from 'react'
import { HiCog } from 'react-icons/hi'

export interface UserProps {
  user: User
}

const UserSettingsPageContent: FC<UserProps> = function ({ user }) {
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
        <GeneralInformationCard
          user={{
            ...user,
            name: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          theme={customTheme}
        />
        <PasswordInformationCard theme={customTheme} />
        <ApiKeysCard theme={customTheme} />
      </div>
    </PageLayout>
  )
}

export default UserSettingsPageContent
