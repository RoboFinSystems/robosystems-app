import { sdkOk } from '@/test-utils/sdk'
import * as SDK from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const startMonitoring = vi.fn()
const showError = vi.fn()

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    useOrg: () => ({ currentOrg: { id: 'org_1', role: 'owner' } }),
    useServiceOfferings: () => ({ offerings: {}, isLoading: false }),
    useApiError: () => ({ handleApiError: vi.fn() }),
    useUser: () => ({ user: { id: 'user_owner' } }),
    useToast: () => ({
      showSuccess: vi.fn(),
      showError,
      ToastContainer: () => null,
    }),
  }
})
vi.mock('@robosystems/core/task-monitoring/hooks', () => ({
  useTaskMonitoring: () => ({
    startMonitoring,
    isLoading: false,
    currentStep: null,
    progress: null,
  }),
}))
vi.mock('@robosystems/core/lib/graph-tiers', () => ({
  fetchGraphTiers: vi.fn(async () => ({
    tiers: [
      { tier: 'ladybug-standard', display_name: 'Standard' },
      { tier: 'ladybug-large', display_name: 'Large' },
    ],
  })),
}))

import { OverviewTab, SubscriptionsTab } from '../billing-panels'

const sub = (
  overrides: Partial<SDK.GraphSubscriptionResponse>
): SDK.GraphSubscriptionResponse =>
  ({
    id: 'sub_1',
    resource_type: 'graph',
    resource_id: 'kg1',
    plan_name: 'ladybug-standard',
    plan_display_name: 'Standard',
    billing_interval: 'month',
    base_price_cents: 5000,
    status: 'active',
    started_at: '2026-01-01T00:00:00Z',
    current_period_end: null,
    ...overrides,
  }) as SDK.GraphSubscriptionResponse

const graphs = [{ graphId: 'kg1', graphName: 'Acme Books' }] as SDK.GraphInfo[]

describe('SubscriptionsTab', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists a past_due graph subscription with a payment-failed badge', () => {
    render(
      <SubscriptionsTab
        subscriptions={[sub({ status: 'past_due' })]}
        graphs={graphs}
        offerings={{}}
        router={{ push: vi.fn() }}
        onRefresh={vi.fn()}
      />
    )
    expect(screen.getByText('Acme Books')).toBeInTheDocument()
    expect(screen.getByText('Payment failed')).toBeInTheDocument()
  })

  it('refreshes as soon as the tier change is accepted, not when the migration ends', async () => {
    startMonitoring.mockReturnValue(new Promise(() => {}))
    vi.mocked(SDK.changeTier).mockResolvedValue(
      sdkOk({ operationId: 'op_1', status: 'pending' })
    )
    const onRefresh = vi.fn()
    render(
      <SubscriptionsTab
        subscriptions={[sub({})]}
        graphs={graphs}
        offerings={{}}
        router={{ push: vi.fn() }}
        onRefresh={onRefresh}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Change Tier/ }))
    fireEvent.click(await screen.findByText('Large'))
    fireEvent.click(screen.getByRole('button', { name: /Confirm Change/ }))
    await waitFor(() => expect(SDK.changeTier).toHaveBeenCalled())
    await waitFor(() => expect(onRefresh).toHaveBeenCalled())
  })
})

describe("SubscriptionsTab, a member's repository seat", () => {
  beforeEach(() => vi.clearAllMocks())

  it("cancels the member's seat, not the owner's", async () => {
    vi.mocked(SDK.cancelRepositorySubscription).mockResolvedValue(sdkOk({}))
    render(
      <SubscriptionsTab
        subscriptions={[
          sub({
            id: 'sub_member',
            resource_type: 'repository',
            resource_id: 'sec',
            user_id: 'user_member',
          }),
        ]}
        graphs={graphs}
        offerings={{}}
        router={{ push: vi.fn() }}
        onRefresh={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Cancel Subscription/ }))
    fireEvent.click(
      await screen.findByRole('button', { name: /Cancel at Period End/ })
    )
    await waitFor(() =>
      expect(SDK.cancelRepositorySubscription).toHaveBeenCalled()
    )
    const [call] = vi.mocked(SDK.cancelRepositorySubscription).mock.calls[0]
    expect(call.body?.user_id).toBe('user_member')
  })

  it("says whose seat each is, and changes plans only on the viewer's own", () => {
    render(
      <SubscriptionsTab
        subscriptions={[
          sub({
            id: 'sub_mine',
            resource_type: 'repository',
            resource_id: 'sec',
            user_id: 'user_owner',
          }),
          sub({
            id: 'sub_member',
            resource_type: 'repository',
            resource_id: 'sec',
            user_id: 'user_member',
          }),
        ]}
        graphs={graphs}
        offerings={{}}
        router={{ push: vi.fn() }}
        onRefresh={vi.fn()}
      />
    )
    expect(screen.getByText(/Your seat/)).toBeInTheDocument()
    expect(screen.getByText(/A member's seat/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Change Plan/ })).toHaveLength(
      1
    )
  })
})

describe('SubscriptionsTab tier change, leaving the page', () => {
  it('does not report a failure when watching stops because the page was left', async () => {
    const { POLLING_CANCELLED } =
      await import('@robosystems/core/task-monitoring/taskMonitor')
    startMonitoring.mockRejectedValue(new Error(POLLING_CANCELLED))
    vi.mocked(SDK.changeTier).mockResolvedValue(
      sdkOk({ operationId: 'op_1', status: 'pending' })
    )
    render(
      <SubscriptionsTab
        subscriptions={[sub({})]}
        graphs={graphs}
        offerings={{}}
        router={{ push: vi.fn() }}
        onRefresh={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Change Tier/ }))
    fireEvent.click(await screen.findByText('Large'))
    fireEvent.click(screen.getByRole('button', { name: /Confirm Change/ }))
    await waitFor(() => expect(startMonitoring).toHaveBeenCalled())
    await new Promise((r) => setTimeout(r, 20))
    expect(showError).not.toHaveBeenCalled()
  })
})

describe('OverviewTab', () => {
  it('counts only graph subscriptions in force as active graphs', () => {
    render(
      <OverviewTab
        billingCustomer={null}
        upcomingInvoice={null}
        hasPaymentMethod
        billingEnabled
        router={{ push: vi.fn() }}
        currentOrg={{ id: 'org_1', name: 'Org' } as SDK.OrgResponse}
        subscriptions={[
          sub({ id: 'a' }),
          sub({ id: 'b', resource_id: 'kg2', status: 'canceled' }),
          sub({ id: 'c', resource_id: 'kg3', status: 'failed' }),
        ]}
        showError={vi.fn()}
      />
    )
    const label = screen.getByText('Active Graphs')
    expect(label.nextElementSibling?.textContent).toBe('1')
  })
})
