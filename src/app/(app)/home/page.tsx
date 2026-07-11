'use client'
import { Spinner, useUser } from '@robosystems/core'
import AllGraphsHomePage from './content'

export default function HomePage() {
  const { user, isLoading } = useUser()

  if (isLoading || !user) {
    return <Spinner size="xl" fullScreen />
  }

  return <AllGraphsHomePage />
}
