import * as SDK from '@robosystems/client'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GraphPricing from '../GraphPricing'

vi.mock('@robosystems/client', () => ({
  getServiceOfferings: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

const mockGetOfferings = vi.mocked(SDK.getServiceOfferings)

function offeringsWith(tiers: Array<Record<string, unknown>>) {
  return Promise.resolve({
    data: { graph_subscriptions: { tiers } },
  }) as unknown as ReturnType<typeof SDK.getServiceOfferings>
}

describe('GraphPricing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fallback prices without waiting for the API', () => {
    mockGetOfferings.mockReturnValue(offeringsWith([]))

    render(<GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />)

    // Present on first paint — no loading state on a marketing page.
    expect(screen.getByText('$99')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
    expect(screen.getByText('$599')).toBeInTheDocument()
  })

  it('reconciles prices from the live offerings endpoint', async () => {
    mockGetOfferings.mockReturnValue(
      offeringsWith([
        {
          name: 'ladybug-standard',
          display_name: 'Standard',
          monthly_price_per_graph: 129,
          monthly_credits_per_graph: 9000,
          max_subgraphs: 4,
          instance_storage_limit_gb: 25,
          backup_retention_days: 14,
        },
      ])
    )

    render(<GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('$129')).toBeInTheDocument())
    expect(screen.queryByText('$99')).not.toBeInTheDocument()
    expect(screen.getByText('9,000 AI credits per month')).toBeInTheDocument()
    expect(screen.getByText('Up to 4 subgraphs')).toBeInTheDocument()
    expect(screen.getByText('25 GB graph storage')).toBeInTheDocument()
    expect(screen.getByText('14-day backup retention')).toBeInTheDocument()
    // Untouched tiers keep their fallback values.
    expect(screen.getByText('$249')).toBeInTheDocument()
  })

  it('falls back on storage when the API omits it', async () => {
    // A partial response must degrade per-field rather than blanking the row.
    mockGetOfferings.mockReturnValue(
      offeringsWith([
        {
          name: 'ladybug-standard',
          display_name: 'Standard',
          monthly_price_per_graph: 129,
        },
      ])
    )

    render(<GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('$129')).toBeInTheDocument())
    expect(screen.getByText('20 GB graph storage')).toBeInTheDocument()
    expect(screen.getByText('8,000 AI credits per month')).toBeInTheDocument()
  })

  it('keeps fallback prices when the offerings call fails', async () => {
    mockGetOfferings.mockReturnValue(
      Promise.reject(new Error('network')) as unknown as ReturnType<
        typeof SDK.getServiceOfferings
      >
    )

    render(<GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />)

    // The page must never blank its prices because the API is unreachable.
    await waitFor(() => expect(mockGetOfferings).toHaveBeenCalled())
    expect(screen.getByText('$99')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
    expect(screen.getByText('$599')).toBeInTheDocument()
  })

  it('ignores zeroed values rather than letting them override the fallback', async () => {
    // `??` falls back on null/undefined but not 0, so an API reporting zeros
    // used to overwrite correct fallbacks — this rendered "Up to 0 subgraphs"
    // against a local API that had no config for the tier.
    mockGetOfferings.mockReturnValue(
      offeringsWith([
        {
          name: 'ladybug-large',
          display_name: 'Large',
          monthly_price_per_graph: 249,
          monthly_credits_per_graph: 32000,
          max_subgraphs: 0,
          instance_storage_limit_gb: 0,
          backup_retention_days: 0,
        },
      ])
    )

    render(<GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('$249')).toBeInTheDocument())
    expect(screen.getByText('Up to 10 subgraphs')).toBeInTheDocument()
    expect(screen.getByText('50 GB graph storage')).toBeInTheDocument()
    expect(screen.getByText('30-day backup retention')).toBeInTheDocument()
    expect(screen.queryByText('Up to 0 subgraphs')).not.toBeInTheDocument()
  })

  it('sends signed-out visitors to register and signed-in users to graph creation', () => {
    mockGetOfferings.mockReturnValue(offeringsWith([]))

    const { rerender } = render(
      <GraphPricing isAuthenticated={false} onContactSales={vi.fn()} />
    )
    expect(screen.getAllByText('Get Started')[0]).toHaveAttribute(
      'href',
      '/register'
    )

    rerender(<GraphPricing isAuthenticated onContactSales={vi.fn()} />)
    expect(screen.getAllByText('Create Graph')[0]).toHaveAttribute(
      'href',
      '/graphs/new'
    )
  })
})
