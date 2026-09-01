import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EnterpriseContent from '../content'

vi.mock('@/components/landing/Header', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/components/landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}))
vi.mock('@/components/landing/FloatingElementsVariant', () => ({
  default: () => null,
}))
vi.mock('@/components/landing/SalesContactModal', () => ({
  default: ({ isOpen, variant }: { isOpen: boolean; variant: string }) =>
    isOpen ? <div data-testid="sales-modal">{variant}</div> : null,
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

describe('EnterpriseContent', () => {
  it('presents all three delivery modes', () => {
    render(<EnterpriseContent />)

    for (const mode of [
      'Managed Platform',
      'Dedicated Deployment',
      'Self-Hosted',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: mode })
      ).toBeInTheDocument()
    }
  })

  it('scopes SSO and SCIM to dedicated deployments and names the verified IdP', () => {
    render(<EnterpriseContent />)

    expect(
      screen.getByText(/verified end-to-end against Okta/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/aren't offered on the managed platform/i)
    ).toBeInTheDocument()
    // Never claim SAML: it is not built.
    expect(screen.queryByText(/SAML/)).not.toBeInTheDocument()
  })

  it('states SOC 2 Type II as in progress, never as completed or certified', () => {
    render(<EnterpriseContent />)

    expect(
      screen.getAllByText(/SOC 2 Type II compliance (is )?in progress/i).length
    ).toBeGreaterThan(0)
    expect(screen.queryByText(/SOC 2 certified/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/completed audit/i)).not.toBeInTheDocument()
  })

  it('never calls the transfer an exit fee', () => {
    render(<EnterpriseContent />)

    expect(screen.getByText('Account Transfer engagement')).toBeInTheDocument()
    expect(screen.queryByText(/exit fee/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/termination fee/i)).not.toBeInTheDocument()
  })

  it('opens the dedicated-deployment sales modal from the hero', () => {
    render(<EnterpriseContent />)

    expect(screen.queryByTestId('sales-modal')).not.toBeInTheDocument()
    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Talk to us about a Dedicated Deployment',
      })[0]
    )
    expect(screen.getByTestId('sales-modal')).toHaveTextContent(
      'dedicated_deployment'
    )
  })

  it('sends self-hosters to the bootstrap guide, not the marketing page', () => {
    render(<EnterpriseContent />)

    // /open-source pitches self-hosting; the wiki is what someone who has
    // already chosen it needs.
    expect(
      screen.getByRole('link', { name: 'Bootstrap guide' })
    ).toHaveAttribute(
      'href',
      'https://github.com/RoboFinSystems/robosystems/wiki/Bootstrap-Guide'
    )
  })

  it('links procurement to the hosted MSA and the Trust Center', () => {
    render(<EnterpriseContent />)

    expect(
      screen.getAllByRole('link', { name: 'Read the MSA' })[0]
    ).toHaveAttribute('href', '/pages/msa')
    expect(screen.getByRole('link', { name: 'Trust Center' })).toHaveAttribute(
      'href',
      'https://trust.robosystems.ai'
    )
  })
})
