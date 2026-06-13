'use client'
import { useUser } from '@/lib/core'
import { BrandSpinner } from '@/lib/core/ui-components'
import UserSettingsPageContent from './content'

export default function UserSettingsPage() {
  const { user, isLoading, refreshUser } = useUser()

  if (isLoading || !user) {
    return <BrandSpinner size="xl" fullScreen />
  }

  return (
    <UserSettingsPageContent
      user={{
        ...user,
        name: user.name || 'Unknown User',
      }}
      onRefresh={async () => {
        await refreshUser()
      }}
    />
  )
}
