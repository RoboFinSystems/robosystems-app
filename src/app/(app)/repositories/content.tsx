'use client'

import CancelSubscriptionModal, {
  type CancelMode,
} from '@/components/app/CancelSubscriptionModal'
import {
  ActiveSubscriptions,
  BrowseRepositories,
  PageLayout,
  useToast,
} from '@/lib/core'
import {
  cancelRepositorySubscription,
  type GraphSubscriptionResponse,
} from '@robosystems/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SharedRepositoriesContent() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [subToCancel, setSubToCancel] =
    useState<GraphSubscriptionResponse | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCancelConfirm = async (mode: CancelMode) => {
    if (!subToCancel) return
    try {
      setCancelling(true)
      const response = await cancelRepositorySubscription({
        path: { graph_id: subToCancel.resource_id },
        body: {
          immediate: mode === 'immediate',
          confirm: mode === 'immediate' ? subToCancel.resource_id : undefined,
        },
      })
      if (response.error) {
        const detail =
          typeof response.error === 'object' && 'detail' in response.error
            ? String(response.error.detail)
            : 'Failed to cancel subscription'
        throw new Error(detail)
      }
      showSuccess(
        mode === 'immediate'
          ? `Subscription to ${subToCancel.resource_id.toUpperCase()} canceled. Access has ended.`
          : `Subscription to ${subToCancel.resource_id.toUpperCase()} will end at the close of your current billing period.`
      )
      setSubToCancel(null)
      // Force ActiveSubscriptions to re-fetch by remounting it.
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('Failed to cancel repo subscription:', error)
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to cancel subscription. Please try again.'
      )
    } finally {
      setCancelling(false)
    }
  }

  return (
    <PageLayout>
      <ActiveSubscriptions
        key={refreshKey}
        onOpenConsole={() => router.push('/console')}
        onOpenUsage={() => router.push('/usage')}
        onGettingStarted={(repoId) =>
          router.push(`/repositories/${repoId}/getting-started`)
        }
        onBackups={() => router.push('/backups')}
        onBilling={() => router.push('/billing')}
        onBrowse={() => router.push('/repositories/browse')}
        onCancel={(subscription) => setSubToCancel(subscription)}
        emptyState={<BrowseRepositoriesContent />}
      />

      <CancelSubscriptionModal
        show={subToCancel !== null}
        onClose={() => setSubToCancel(null)}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
        resourceType="repository"
        resourceName={subToCancel?.resource_id.toUpperCase() ?? ''}
        resourceId={subToCancel?.resource_id ?? ''}
        planLabel={subToCancel?.plan_display_name}
        priceCents={subToCancel?.base_price_cents}
        billingInterval={subToCancel?.billing_interval}
        currentPeriodEnd={subToCancel?.current_period_end ?? null}
      />
    </PageLayout>
  )
}

function BrowseRepositoriesContent() {
  const router = useRouter()

  return (
    <BrowseRepositories
      onSubscribed={(repoType) =>
        router.push(`/repositories/${repoType}/getting-started`)
      }
      onViewSubscriptions={() => router.push('/repositories')}
    />
  )
}
