import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TierRequestForm, {
  buildTierRequestMessage,
  type TierRequestTarget,
} from '../TierRequestForm'

vi.mock('@/lib/config/turnstile', () => ({
  isTurnstileEnabled: vi.fn().mockReturnValue(false),
  isTurnstileValid: vi.fn().mockReturnValue(true),
}))

vi.mock('@robosystems/core/auth-components/TurnstileWidget', async () => {
  const React = await import('react')
  const MockTurnstileWidget = React.forwardRef((_props: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: vi.fn(),
    }))
    return <div data-testid="turnstile-widget">Turnstile Widget</div>
  })
  MockTurnstileWidget.displayName = 'MockTurnstileWidget'
  return { TurnstileWidget: MockTurnstileWidget }
})

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

const largeTier: TierRequestTarget = {
  tier: 'ladybug-large',
  displayName: 'Large',
  monthlyPrice: 249,
  capacityStatus: 'at_capacity',
}

describe('buildTierRequestMessage', () => {
  it('names the tier, price, capacity state, org and workload', () => {
    const message = buildTierRequestMessage(
      largeTier,
      'org_test123',
      'Two entities, ~40k GL lines'
    )

    expect(message).toContain('[TIER ACCESS REQUEST]')
    expect(message).toContain('Tier: Large (ladybug-large) — $249/month')
    expect(message).toContain('Capacity status: at_capacity')
    expect(message).toContain('Org ID: org_test123')
    expect(message).toContain('Workload: Two entities, ~40k GL lines')
  })

  it('degrades gracefully when price, org and workload are missing', () => {
    const message = buildTierRequestMessage(
      { tier: 'ladybug-xlarge', displayName: 'XLarge' },
      undefined,
      '   '
    )

    expect(message).toContain('Tier: XLarge (ladybug-xlarge)\n')
    expect(message).not.toContain('/month')
    expect(message).toContain('Capacity status: unknown')
    expect(message).toContain('Org ID: Not available')
    expect(message).toContain('Workload: Not provided')
  })
})

describe('TierRequestForm', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  it('renders the form with account fields prefilled from the session', () => {
    render(
      <TierRequestForm
        target={largeTier}
        onClose={mockOnClose}
        userName="Jane Doe"
        userEmail="jane@example.com"
        orgName="Acme Corp"
      />
    )

    expect(
      (screen.getByLabelText(/full name/i) as HTMLInputElement).value
    ).toBe('Jane Doe')
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe(
      'jane@example.com'
    )
    expect((screen.getByLabelText(/company/i) as HTMLInputElement).value).toBe(
      'Acme Corp'
    )
    expect(
      screen.getByLabelText(/what are you bringing in/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /request access/i })
    ).toBeInTheDocument()
  })

  it('submits a tier-request tagged contact with the tier in the message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(
      <TierRequestForm
        target={largeTier}
        onClose={mockOnClose}
        userName="Jane Doe"
        userEmail="jane@example.com"
        orgName="Acme Corp"
        orgId="org_test123"
      />
    )

    fireEvent.change(screen.getByLabelText(/what are you bringing in/i), {
      target: { value: 'Two entities, ~40k GL lines' },
    })
    fireEvent.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    const fetchCall = mockFetch.mock.calls[0]
    expect(fetchCall[0]).toBe('/api/contact')
    expect(fetchCall[1].method).toBe('POST')
    expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' })

    const body = JSON.parse(fetchCall[1].body)
    expect(body.name).toBe('Jane Doe')
    expect(body.email).toBe('jane@example.com')
    expect(body.company).toBe('Acme Corp')
    expect(body.type).toBe('tier-request')
    expect(body.message).toContain('[TIER ACCESS REQUEST]')
    expect(body.message).toContain('Tier: Large (ladybug-large) — $249/month')
    expect(body.message).toContain('Org ID: org_test123')
    expect(body.message).toContain('Workload: Two entities, ~40k GL lines')
  })

  it('shows the confirmation naming the tier and the email after success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(
      <TierRequestForm
        target={largeTier}
        onClose={mockOnClose}
        userName="Jane Doe"
        userEmail="jane@example.com"
        orgName="Acme Corp"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(screen.getByText('Request received')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/reach out at jane@example.com to get the Large tier/i)
    ).toBeInTheDocument()
  })

  it('shows an error and keeps the form when the request is rejected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Too many requests' }),
    })

    render(
      <TierRequestForm
        target={largeTier}
        onClose={mockOnClose}
        userName="Jane Doe"
        userEmail="jane@example.com"
        orgName="Acme Corp"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. Please try again later.')
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /request access/i })
    ).toBeInTheDocument()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('closes on cancel without submitting', () => {
    render(<TierRequestForm target={largeTier} onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
