'use client'

import { Spinner, useUser } from '@robosystems/core'
import ActivityContent from './content'

export default function ActivityPage() {
  const { user, isLoading } = useUser()

  if (isLoading || !user) {
    return <Spinner size="xl" fullScreen />
  }

  return <ActivityContent />
}
