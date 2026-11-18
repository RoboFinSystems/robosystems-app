'use client'

import { openBillingPortal } from '@/lib/billing-portal'
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
 * and what happens when it ends. With a card on file the plan starts by itself
 * and can start now; a trial taken without a card ends with nothing charged
 * unless a card is added, so it offers that instead. Renders nothing for a
 * subscriber who is not on a trial.
 */
export default function TrialBanner({ repository }: TrialBannerProps) {
  const router = useRouter()
  const { currentOrg } = useOrg()
  const { user } = useUser()
  const [trial, setTrial] = useState<SDK.GraphSubscriptionResponse>()
  // Unknown until the billing read lands; unknown keeps the card wording.
  const [hasCard, setHasCard] = useState<boolean>()
  const [openingPortal, setOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState<string>()

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
    SDK.getOrgBillingCustomer({ path: { org_id: currentOrg.id } })
      .then((response) => {
        if (cancelled) return
        const customer = unwrapSdk(response)
        if (customer) {
          setHasCard(
            customer.has_payment_method || customer.invoice_billing_enabled
          )
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [currentOrg?.id, user?.id, repository])

  if (!trial?.trial_ends_at) return null

  const ends = format(utcDate(trial.trial_ends_at), 'MMM d')
  const price = `$${(trial.base_price_cents / 100).toFixed(2)}`
  const canceled = trial.status === 'canceled'
  const noCard = !canceled && hasCard === false

  const addCard = async () => {
    if (!currentOrg?.id) return
    setOpeningPortal(true)
    setPortalError(undefined)
    try {
      await openBillingPortal(currentOrg.id)
    } catch (error) {
      setPortalError(
        error instanceof Error ? error.message : 'Could not open billing.'
      )
      setOpeningPortal(false)
    }
  }

  return (
    <Alert color="info" icon={HiInformationCircle}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-semibold">
            {canceled
              ? `Your free trial of ${trial.plan_display_name} runs to ${ends}. Nothing will be charged.`
              : noCard
                ? `Your free trial of ${trial.plan_display_name} ends on ${ends}.`
                : `You are on a free trial of ${trial.plan_display_name} until ${ends}.`}
          </p>
          <p>
            The trial opens the analysis tools over MCP and the API, at lower
            rate limits than the plan. Raw queries, the AI analyst and your
            monthly credits open with the first payment.
          </p>
          {noCard && (
            <p>
              Add a card to keep your plan ({price} a month); without one the
              trial ends and nothing is charged.
            </p>
          )}
          {!canceled && !noCard && (
            <p>
              Your plan starts by itself on {ends} ({price}). You do not have to
              wait: starting it now lifts the trial limits at once.
            </p>
          )}
          {portalError && (
            <p className="text-red-700 dark:text-red-400">{portalError}</p>
          )}
        </div>
        {noCard && (
          <Button
            color="blue"
            className="shrink-0"
            onClick={addCard}
            disabled={openingPortal}
          >
            {openingPortal ? 'Opening…' : 'Add a Card'}
          </Button>
        )}
        {!canceled && !noCard && (
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
