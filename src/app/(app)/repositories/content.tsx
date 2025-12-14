'use client'

import {
  customTheme,
  useGraphContext,
  useOrg,
  useServiceOfferings,
  useToast,
} from '@/lib/core'
import * as SDK from '@robosystems/client'
import { Badge, Button, Card, Spinner } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  HiBookOpen,
  HiCheckCircle,
  HiCreditCard,
  HiDatabase,
  HiGlobeAlt,
  HiLightningBolt,
  HiTerminal,
} from 'react-icons/hi'
import { BrowseRepositoriesContent } from './browse/content'

// Use the SDK type directly - id field contains the subscription ID
type SubscriptionInfo = SDK.GraphSubscriptionResponse

export function SharedRepositoriesContent() {
  const [userSubscriptions, setUserSubscriptions] = useState<
    SubscriptionInfo[]
  >([])
  const [loading, setLoading] = useState(true)
  const { showError, ToastContainer } = useToast()
  const { currentOrg } = useOrg()
  const router = useRouter()
  const { offerings, isLoading: offeringsLoading } = useServiceOfferings()
  const { setCurrentGraph } = useGraphContext()

  const loadData = useCallback(async () => {
    if (!currentOrg?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Load org subscriptions and filter for repositories
      const subscriptionsResponse = await SDK.listOrgSubscriptions({
        path: { org_id: currentOrg.id },
      })

      if (subscriptionsResponse.data) {
        // Filter for repository subscriptions only
        const repositorySubscriptions = (
          subscriptionsResponse.data || []
        ).filter(
          (sub: SDK.GraphSubscriptionResponse) =>
            sub.resource_type === 'repository'
        )
        setUserSubscriptions(repositorySubscriptions as SubscriptionInfo[])
      } else {
        setUserSubscriptions([])
      }
    } catch (error) {
      console.error('Failed to load user subscriptions:', error)
      showError('Failed to load user subscriptions')
    } finally {
      setLoading(false)
    }
  }, [currentOrg?.id, showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading || offeringsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  // Show all active subscriptions
  const activeSubscriptions = userSubscriptions.filter(
    (s) => s.status === 'active'
  )
  const hasActiveSubscriptions = activeSubscriptions.length > 0

  // If no active subscriptions, show the browse page directly
  if (!hasActiveSubscriptions) {
    return <BrowseRepositoriesContent />
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
            <HiGlobeAlt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Repository Subscriptions
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Browse shared public datasets
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/repositories/browse')}
          color="purple"
        >
          <HiGlobeAlt className="mr-2 h-4 w-4" />
          Browse Repositories
        </Button>
      </div>

      {/* Active Subscriptions */}
      <ActiveSubscriptionsTab
        subscriptions={activeSubscriptions}
        offerings={offerings}
        router={router}
        onRefresh={loadData}
        setCurrentGraph={setCurrentGraph}
      />
    </div>
  )
}

function ActiveSubscriptionsTab({
  subscriptions,
  offerings,
  router,
  onRefresh,
  setCurrentGraph,
}: {
  subscriptions: SubscriptionInfo[]
  offerings: any
  router: any
  onRefresh: () => void
  setCurrentGraph: (graphId: string) => Promise<void>
}) {
  const handleOpenConsole = async (repositoryId: string) => {
    // Set the repository as the current graph
    await setCurrentGraph(repositoryId)
    // Navigate to console
    router.push('/console')
  }

  const handleOpenUsage = async (repositoryId: string) => {
    // Set the repository as the current graph
    await setCurrentGraph(repositoryId)
    // Navigate to usage page
    router.push('/usage')
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => {
        const repoOffering =
          offerings?.repositoryPlans?.[subscription.resource_id]

        // Find the plan features - handle case insensitive matching
        const planFeatures = repoOffering?.plans?.find(
          (p: any) =>
            p.plan.toLowerCase() === subscription.plan_name.toLowerCase()
        )?.features

        return (
          <Card key={subscription.resource_id} theme={customTheme.card}>
            <div className="space-y-6">
              {/* Repository Header with Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
                    <HiDatabase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {repoOffering?.name ||
                        subscription.resource_id.toUpperCase()}
                    </h2>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {repoOffering?.description ||
                        'Shared repository subscription'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge color="success" icon={HiCheckCircle}>
                        Active
                      </Badge>
                      <Badge color="purple">
                        {subscription.plan_name.charAt(0).toUpperCase() +
                          subscription.plan_name.slice(1)}{' '}
                        Plan
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ID: {subscription.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Actions */}
              <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
                <h4 className="font-heading mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Quick Actions
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button
                    color="gray"
                    onClick={() =>
                      router.push(
                        `/repositories/${subscription.resource_id}/getting-started`
                      )
                    }
                    className="justify-start"
                  >
                    <HiBookOpen className="mr-2 h-4 w-4" />
                    Getting Started
                  </Button>

                  <Button
                    color="gray"
                    onClick={() => handleOpenConsole(subscription.resource_id)}
                    className="justify-start"
                  >
                    <HiTerminal className="mr-2 h-4 w-4" />
                    Console
                  </Button>

                  <Button
                    color="gray"
                    onClick={() => handleOpenUsage(subscription.resource_id)}
                    className="justify-start"
                  >
                    <HiLightningBolt className="mr-2 h-4 w-4" />
                    Credits & Usage
                  </Button>

                  <Button
                    color="gray"
                    onClick={() => router.push('/billing')}
                    className="justify-start"
                  >
                    <HiCreditCard className="mr-2 h-4 w-4" />
                    Billing Details
                  </Button>
                </div>
              </div>

              {/* Plan Details - Only show if we have features */}
              {planFeatures && planFeatures.length > 0 && (
                <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
                  <h4 className="font-heading mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    Plan Features
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {planFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <HiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
