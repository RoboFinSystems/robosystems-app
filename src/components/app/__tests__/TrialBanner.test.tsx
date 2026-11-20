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

import TrialBanner, { runningTrial } from '../TrialBanner'

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

const card = (onFile: boolean) =>
  vi.mocked(SDK.getOrgBillingCustomer).mockResolvedValue(
    sdkOk({
      org_id: 'org_1',
      has_payment_method: onFile,
      invoice_billing_enabled: false,
      payment_methods: [],
      created_at: '2026-11-01T00:00:00',
    } as SDK.BillingCustomer)
  )

describe('TrialBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    card(true)
  })

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
  })

  it('starts the plan from the banner, after a confirmation', async () => {
    listing([seat()])
    vi.mocked(SDK.endRepositorySubscriptionTrial).mockResolvedValue(
      sdkOk(seat({ trial_ends_at: undefined }))
    )
    render(<TrialBanner />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Start Plan Now' })
    )
    expect(screen.getByText(/\$29\.00 is charged/)).toBeInTheDocument()
    expect(SDK.endRepositorySubscriptionTrial).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Start Plan and Pay' }))

    await waitFor(() =>
      expect(SDK.endRepositorySubscriptionTrial).toHaveBeenCalledWith({
        path: { graph_id: 'sec' },
      })
    )
    expect(await screen.findByText(/Trial ended/)).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('offers no early start on a canceled trial', async () => {
    listing([seat({ status: 'canceled' })])
    render(<TrialBanner />)

    expect(
      await screen.findByText(/Nothing will be charged/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start Plan Now' })).toBeNull()
  })

  it('does not count a trial that ended at once as running', () => {
    const ended = seat({
      status: 'canceled',
      ends_at: new Date(Date.now() - 60_000).toISOString(),
    })
    const cancelledAtEnd = seat({ status: 'canceled', ends_at: undefined })
    expect(runningTrial([ended], 'user_me')).toBeUndefined()
    expect(runningTrial([cancelledAtEnd], 'user_me')).toBe(cancelledAtEnd)
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

  it('asks for a card when the trial was taken without one', async () => {
    listing([seat()])
    card(false)
    vi.mocked(SDK.createPortalSession).mockResolvedValue(
      sdkOk({ portal_url: 'https://billing.stripe.com/p/session/x' })
    )
    render(<TrialBanner />)

    expect(
      await screen.findByText(/Add a card to keep your plan/)
    ).toBeInTheDocument()
    expect(screen.getByText(/nothing is charged/)).toBeInTheDocument()
    expect(screen.queryByText(/starts by itself/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start Plan Now' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Add a Card' }))
    await waitFor(() =>
      expect(SDK.createPortalSession).toHaveBeenCalledWith({
        path: { org_id: 'org_1' },
      })
    )
  })

  it('keeps the start-by-itself wording once a card is on file', async () => {
    listing([seat()])
    render(<TrialBanner />)

    expect(await screen.findByText(/starts by itself/)).toBeInTheDocument()
    await waitFor(() => expect(SDK.getOrgBillingCustomer).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: 'Add a Card' })).toBeNull()
  })
})
