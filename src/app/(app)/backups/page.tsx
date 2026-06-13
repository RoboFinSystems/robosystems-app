'use client'

import { BrandSpinner, useUser } from '@/lib/core'
import BackupManagementContent from './content'

export default function BackupsPage() {
  const { user, isLoading } = useUser()

  if (isLoading || !user) {
    return <BrandSpinner size="xl" fullScreen />
  }

  return <BackupManagementContent />
}
