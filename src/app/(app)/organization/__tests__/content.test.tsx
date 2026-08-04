import * as SDK from '@robosystems/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrganizationContent } from '../content'

// Billing used to be a whole page nested inside an Organization tab, which
// rendered a second PageHeader and a second tab row inside the first. Its three
// panels are now peers of Graphs and Members. These tests pin that flattening,
// the ?tab= deep link Stripe and the API redirect into, and the role gating.

const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/organization',
  useSearchParams: () => mockSearchParams,
}))

const mockCurrentOrg = {
  id: 'org_123',
  name: 'Test Org',
  org_type: 'personal',
  role: 'owner',
  member_count: 1,
  graph_count: 0,
}

let mockOrgValue: Record<string, unknown> = {}

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    useOrg: () => mockOrgValue,
    useGraphContext: () => ({ state: { graphs: [] } }),
    useServiceOfferings: () => ({
      offerings: { billingEnabled: true },
      isLoading: false,
    }),
    useApiError: () => ({ handleApiError: vi.fn() }),
    useToast: () => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      ToastContainer: () => null,
    }),
  }
})

/** Names of the tabs actually rendered, in order. */
const tabNames = () =>
  screen.getAllByRole('tab').map((t) => t.textContent?.trim())

const setRole = (role: string) => {
  mockOrgValue = {
    currentOrg: { ...mockCurrentOrg, role },
    refreshOrgs: vi.fn(),
    loading: false,
  }
}

describe('OrganizationContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    setRole('owner')

    vi.mocked(SDK.listOrgMembers).mockResolvedValue({
      data: { members: [] },
    } as never)
    vi.mocked(SDK.getOrgLimits).mockResolvedValue({
      data: {
        max_graphs: 5,
        can_create_graph: true,
        warnings: [],
        current_usage: { graphs: { current: 0 } },
      },
    } as never)
    vi.mocked(SDK.getOrgUsage).mockResolvedValue({
      data: { period_days: 30, graph_details: [] },
    } as never)
    vi.mocked(SDK.listOrgInvitations).mockResolvedValue({
      data: { invitations: [] },
    } as never)

    vi.mocked(SDK.getOrgBillingCustomer).mockResolvedValue({
      data: { has_payment_method: true, invoice_billing_enabled: false },
    } as never)
    vi.mocked(SDK.listOrgSubscriptions).mockResolvedValue({ data: [] } as never)
    vi.mocked(SDK.getOrgUpcomingInvoice).mockResolvedValue({
      data: null,
    } as never)
    vi.mocked(SDK.listOrgInvoices).mockResolvedValue({
      data: { invoices: [] },
    } as never)
  })

  it('renders billing as flat peers of Graphs and Members, in one tab row', async () => {
    render(<OrganizationContent />)

    await waitFor(() =>
      expect(tabNames()).toEqual([
        'Graphs',
        'Members',
        'Billing',
        'Subscriptions',
        'Invoices',
      ])
    )

    // One tab row, not a billing row nested inside an org row.
    expect(screen.getAllByRole('tablist')).toHaveLength(1)
    // One page header — billing no longer brings its own.
    expect(
      screen.queryByText('Billing & Subscriptions')
    ).not.toBeInTheDocument()
  })

  it('opens the tab named by ?tab=, the target Stripe and /billing redirect to', async () => {
    mockSearchParams = new URLSearchParams('tab=billing')
    render(<OrganizationContent />)

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Billing/ })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('does not fetch billing data until a billing tab is reached', async () => {
    render(<OrganizationContent />)

    await waitFor(() => expect(SDK.listOrgMembers).toHaveBeenCalled())
    expect(SDK.getOrgBillingCustomer).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('tab', { name: /Invoices/ }))
    await waitFor(() => expect(SDK.getOrgBillingCustomer).toHaveBeenCalled())
  })

  it('writes the selected tab back to the URL so the view is linkable', async () => {
    render(<OrganizationContent />)

    await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(5))
    await userEvent.click(screen.getByRole('tab', { name: /Subscriptions/ }))

    expect(mockReplace).toHaveBeenCalledWith(
      '/organization?tab=subscriptions',
      { scroll: false }
    )
  })

  it('falls back to a visible tab when a member deep-links into billing', async () => {
    // Members reach /billing from the API's upsell messages but have no billing
    // tabs; landing on an empty selection would look broken.
    setRole('member')
    mockSearchParams = new URLSearchParams('tab=billing')
    render(<OrganizationContent />)

    await waitFor(() => expect(tabNames()).toEqual(['Members']))
    expect(screen.getByRole('tab', { name: /Members/ })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(SDK.getOrgBillingCustomer).not.toHaveBeenCalled()
  })
})
