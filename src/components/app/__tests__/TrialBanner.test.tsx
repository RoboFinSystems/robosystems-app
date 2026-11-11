import { sdkOk } from '@/test-utils/sdk'
import * as SDK from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    useOrg: () => ({ currentOrg: { id: 'org_1' } }),
    useUser: () => ({ user: { id: 'user_me' } }),
  }
})

import TrialBanner from '../TrialBanner'

const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, -1)

const seat = (overrides: Partial<SDK.GraphSubscriptionResponse> = {}) =>
  ({
    id: 'sub_1',
    resource_type: 'repository',
    resource_id: 'sec',
    user_id: 'user_me',
    plan_name: 'starter',
    plan_display_name: 'SEC EDGAR Filings - Starter',
    billing_interval: 'monthly',
    base_price_cents: 2900,
    status: 'active',
    trial_ends_at: inDays(9),
    ...overrides,
  }) as SDK.GraphSubscriptionResponse

const listing = (rows: SDK.GraphSubscriptionResponse[]) =>
  vi.mocked(SDK.listOrgSubscriptions).mockResolvedValue(sdkOk(rows))

describe('TrialBanner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('says what the trial is and that the wait is optional', async () => {
    listing([seat()])
    render(<TrialBanner />)

    expect(
      await screen.findByText(/You are on a free trial of SEC EDGAR Filings/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/lower rate limits than the plan/)
    ).toBeInTheDocument()
    expect(screen.getByText(/You do not have to wait/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start Plan Now' }))
    expect(push).toHaveBeenCalledWith('/organization?tab=subscriptions')
  })

  it('offers no early start on a canceled trial', async () => {
    listing([seat({ status: 'canceled' })])
    render(<TrialBanner />)

    expect(
      await screen.findByText(/Nothing will be charged/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start Plan Now' })).toBeNull()
  })

  it("renders nothing once the trial is over, for a member's seat, or for another repository", async () => {
    listing([
      seat({
        trial_ends_at: new Date(Date.now() - 60_000).toISOString().slice(0, -1),
      }),
      seat({ id: 'sub_2', user_id: 'user_other' }),
    ])
    const { container, unmount } = render(<TrialBanner />)
    await waitFor(() => expect(SDK.listOrgSubscriptions).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
    unmount()

    listing([seat()])
    const other = render(<TrialBanner repository="industry" />)
    await waitFor(() =>
      expect(SDK.listOrgSubscriptions).toHaveBeenCalledTimes(2)
    )
    expect(other.container).toBeEmptyDOMElement()
  })
})
