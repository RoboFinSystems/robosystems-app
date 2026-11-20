import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import CancelSubscriptionModal from '../CancelSubscriptionModal'

const renderModal = (status: string) =>
  render(
    <CancelSubscriptionModal
      show
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      resourceType="graph"
      resourceName="Acme Books"
      resourceId="kg1"
      status={status}
      currentPeriodEnd="2026-12-01T03:00:00"
    />
  )

describe('CancelSubscriptionModal', () => {
  it('offers the end of the period, with a credit, for a paid graph', () => {
    renderModal('active')

    expect(screen.getByText(/At end of billing period/)).toBeInTheDocument()
    expect(screen.getByText(/is credited, not refunded/)).toBeInTheDocument()
  })

  it('offers only deletion, with no credit, for a graph whose payment failed', () => {
    renderModal('past_due')

    expect(screen.queryByText(/At end of billing period/)).toBeNull()
    expect(screen.getByText(/Nothing is credited/)).toBeInTheDocument()
    expect(
      screen.getByLabelText('Confirm by typing resource id')
    ).toBeInTheDocument()
  })

  it('reads the period end as UTC', () => {
    renderModal('active')

    // The zone-less stamp is UTC: shown as that instant in the viewer's zone
    // (Nov 30 west of Greenwich), not as 03:00 local on Dec 1.
    expect(
      screen.getByText(
        new RegExp(
          new Date(Date.UTC(2026, 11, 1, 3)).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        )
      )
    ).toBeInTheDocument()
  })
})
