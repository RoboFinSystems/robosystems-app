import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TierRequestModal from '../TierRequestModal'

vi.mock('@robosystems/core', () => ({
  useUser: () => ({
    user: {
      id: 'user_1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      emailVerified: true,
    },
    isLoading: false,
    isAuthenticated: true,
    refreshUser: vi.fn(),
  }),
  useOrg: () => ({
    currentOrg: { id: 'org_test123', name: 'Acme Corp' },
    orgs: [],
    loading: false,
    error: null,
    refreshOrgs: vi.fn(),
    setCurrentOrg: vi.fn(),
  }),
}))

vi.mock('../TierRequestForm', () => ({
  __esModule: true,
  default: vi.fn(({ target, onClose, userName, userEmail, orgName, orgId }) => (
    <div data-testid="tier-request-form">
      <div>Form tier: {target.tier}</div>
      <div>User: {userName}</div>
      <div>Email: {userEmail}</div>
      <div>Company: {orgName}</div>
      <div>Org ID: {orgId}</div>
      <button onClick={onClose}>Close Form</button>
    </div>
  )),
}))

const largeTier = {
  tier: 'ladybug-large',
  displayName: 'Large',
  monthlyPrice: 249,
  capacityStatus: 'at_capacity',
}

describe('TierRequestModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the request for a larger tier with the provisioned-on-request story', () => {
    render(
      <TierRequestModal
        isOpen={true}
        onClose={mockOnClose}
        target={largeTier}
      />
    )

    expect(screen.getByText('Request access to Large')).toBeInTheDocument()
    expect(
      screen.getByText(/larger tiers are set up on request/i)
    ).toBeInTheDocument()
  })

  it('tells the entry-tier story when the entry tier is full', () => {
    render(
      <TierRequestModal
        isOpen={true}
        onClose={mockOnClose}
        target={{
          ...largeTier,
          tier: 'ladybug-standard',
          displayName: 'Standard',
        }}
        isEntryTier
      />
    )

    expect(screen.getByText('Request access to Standard')).toBeInTheDocument()
    expect(screen.getByText(/Standard is currently full/i)).toBeInTheDocument()
  })

  it('prefills the form from the session and the current org', () => {
    render(
      <TierRequestModal
        isOpen={true}
        onClose={mockOnClose}
        target={largeTier}
      />
    )

    expect(screen.getByText('Form tier: ladybug-large')).toBeInTheDocument()
    expect(screen.getByText('User: Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Email: jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Company: Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Org ID: org_test123')).toBeInTheDocument()
  })

  it('renders nothing when closed or without a target', () => {
    const { rerender } = render(
      <TierRequestModal
        isOpen={false}
        onClose={mockOnClose}
        target={largeTier}
      />
    )
    expect(screen.queryByText(/request access to/i)).not.toBeInTheDocument()

    rerender(
      <TierRequestModal isOpen={true} onClose={mockOnClose} target={null} />
    )
    expect(screen.queryByText(/request access to/i)).not.toBeInTheDocument()
  })

  it('passes onClose through to the form', () => {
    render(
      <TierRequestModal
        isOpen={true}
        onClose={mockOnClose}
        target={largeTier}
      />
    )

    fireEvent.click(screen.getByText('Close Form'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
