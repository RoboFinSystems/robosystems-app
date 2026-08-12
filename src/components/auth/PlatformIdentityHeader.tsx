'use client'

import type { AppName } from '@robosystems/core'
import { getAppConfig } from '@robosystems/core/auth-core/config'
import { LogoBadge } from '@robosystems/core/ui-components'

const PRODUCT_FAMILY: AppName[] = ['robosystems', 'roboledger', 'roboinvestor']

export interface PlatformIdentityHeaderProps {
  title: string
  /** App key the user continues to after auth, when arriving from a product app. */
  continuesTo?: string | null
}

/**
 * The login home's platform identity (Atlassian model): one RoboSystems
 * account across the product family, with a "Continues to {App}" context
 * line when the user arrived from a product funnel. Product apps carry
 * their own branding on their splash pages — this surface is deliberately
 * platform-branded, not per-app themed.
 */
export function PlatformIdentityHeader({
  title,
  continuesTo,
}: PlatformIdentityHeaderProps) {
  const continuesToApp =
    continuesTo && PRODUCT_FAMILY.includes(continuesTo as AppName)
      ? (continuesTo as AppName)
      : null

  return (
    <div className="text-center">
      <LogoBadge animate="once" className="mx-auto h-14 w-14" />
      <h1 className="font-heading mt-4 text-center text-2xl font-semibold tracking-tight text-white">
        RoboSystems
      </h1>
      <h2 className="mt-2 text-center text-xl font-semibold tracking-tight text-gray-300">
        {title}
      </h2>
      <div className="mt-4 flex items-center justify-center gap-2.5">
        {PRODUCT_FAMILY.map((app) => (
          <LogoBadge key={app} app={app} className="h-6 w-6 rounded-md" />
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        One account for RoboSystems, RoboLedger &amp; RoboInvestor
      </p>
      {continuesToApp && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-300">
          Continues to
          <LogoBadge app={continuesToApp} className="h-4 w-4 rounded" />
          <span className="font-medium text-white">
            {getAppConfig(continuesToApp).displayName}
          </span>
        </p>
      )}
    </div>
  )
}
