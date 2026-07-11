'use client'

import { Spinner, useUser } from '@robosystems/core'
import BackupManagementContent from './content'

export default function BackupsPage() {
  const { user, isLoading } = useUser()

  if (isLoading || !user) {
    return <Spinner size="xl" fullScreen />
  }

  return <BackupManagementContent />
}
