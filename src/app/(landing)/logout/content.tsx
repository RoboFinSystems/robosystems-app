'use client'

import { CURRENT_APP, parseReturnTo } from '@robosystems/core'
import { useAuth } from '@robosystems/core/auth-components/AuthProvider'
import { getAppConfig } from '@robosystems/core/auth-core/config'
import { BrandSpinner } from '@robosystems/core/ui-components'
import { useEffect, useRef } from 'react'

/**
 * The login home's end of the logout chain. A product app's manual logout
 * clears its own session then lands here with `?return_to={app}` so the
 * anchor session dies too — without this, the next visit silently
 * re-bridges and "log out" appears not to work. The user is returned to
 * the app they came from (validated against the app registry, never a
 * free-form URL); visiting /logout directly signs out locally.
 */
export default function LogoutContent() {
  const { logout } = useAuth()
  const startedRef = useRef(false)

  useEffect(() => {
    // One-shot: logout() navigates away; a StrictMode re-run would fire it
    // twice with the second run racing the first's redirect.
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const raw = new URLSearchParams(window.location.search).get('return_to')
    const parsed = parseReturnTo(raw)
    if (parsed && parsed.app !== CURRENT_APP) {
      void logout(undefined, { redirectTo: getAppConfig(parsed.app).url })
    } else {
      void logout()
    }
  }, [logout])

  return <BrandSpinner size="xl" fullScreen />
}
