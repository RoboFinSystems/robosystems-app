'use client'

import * as SDK from '@robosystems/client'
import { useOrg, useUser } from '@robosystems/core'
import { unwrapSdk } from '@robosystems/core/lib/sdk-errors'
import { utcDate } from '@robosystems/core/lib/utc-date'
import { Alert, Button } from '@robosystems/core/ui'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiInformationCircle } from 'react-icons/hi'

/**
 * A repository subscription whose free trial is still running. A canceled
 * trial runs to the same date but converts to nothing, so it is not offered
 * an early start.
 */
export function runningTrial(
  subscriptions: SDK.GraphSubscriptionResponse[],
  userId: string | undefined,
  repository?: string
): SDK.GraphSubscriptionResponse | undefined {
  return subscriptions.find(
    (s) =>
      s.resource_type === 'repository' &&
      (!repository || s.resource_id === repository) &&
      (!s.user_id || s.user_id === userId) &&
      (s.status === 'active' || s.status === 'canceled') &&
      !!s.trial_ends_at &&
      utcDate(s.trial_ends_at) > new Date()
  )
}

interface TrialBannerProps {
  /** Show only for this repository; any repository trial when omitted. */
  repository?: string
}

/**
 * Says what a trial is while one is running: what is open, what is held back
 * and how to start the plan without waiting for the trial to end. Renders
 * nothing for a subscriber who is not on a trial.
 */
export default function TrialBanner({ repository }: TrialBannerProps) {
  const router = useRouter()
  const { currentOrg } = useOrg()
  const { user } = useUser()
  const [trial, setTrial] = useState<SDK.GraphSubscriptionResponse>()

  useEffect(() => {
    if (!currentOrg?.id) return
    let cancelled = false
    SDK.listOrgSubscriptions({ path: { org_id: currentOrg.id } })
      .then((response) => {
        if (cancelled) return
        setTrial(runningTrial(unwrapSdk(response) ?? [], user?.id, repository))
      })
      .catch(() => {
        // The banner is an aid; the Subscriptions tab reports a failed read.
      })
    return () => {
      cancelled = true
    }
  }, [currentOrg?.id, user?.id, repository])

  if (!trial?.trial_ends_at) return null

  const ends = format(utcDate(trial.trial_ends_at), 'MMM d')
  const price = `$${(trial.base_price_cents / 100).toFixed(2)}`
  const canceled = trial.status === 'canceled'

  return (
    <Alert color="info" icon={HiInformationCircle}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-semibold">
            {canceled
              ? `Your free trial of ${trial.plan_display_name} runs to ${ends}. Nothing will be charged.`
              : `You are on a free trial of ${trial.plan_display_name} until ${ends}.`}
          </p>
          <p>
            The trial opens the analysis tools over MCP and the API, at lower
            rate limits than the plan. Raw queries, the AI analyst and your
            monthly credits open with the first payment.
          </p>
          {!canceled && (
            <p>
              Your plan starts by itself on {ends} ({price}). You do not have to
              wait: starting it now lifts the trial limits at once.
            </p>
          )}
        </div>
        {!canceled && (
          <Button
            color="blue"
            className="shrink-0"
            onClick={() => router.push('/organization?tab=subscriptions')}
          >
            Start Plan Now
          </Button>
        )}
      </div>
    </Alert>
  )
}
