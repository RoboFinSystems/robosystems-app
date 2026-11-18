import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DeploymentSection from '../DeploymentSection'

vi.mock('../ContactModal', () => ({
  default: ({ isOpen, title }: { isOpen: boolean; title?: string }) =>
    isOpen ? <div data-testid="contact-modal">{title}</div> : null,
}))

describe('DeploymentSection', () => {
  it('names the offer, who delivers it, the fee and what it leaves out', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Finance AI Deployment',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Delivered by Harbinger FinLab')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '$7,500 to $10,000, fixed by scope: half up front, half at handover.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/^Hosting is separate: from \$99 a graph a month/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/\$10,000 adds one data source from another system/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('You keep everything Harbinger builds.')
    ).toBeInTheDocument()
  })

  it('books through /book and links the offer on harbinger.finance', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByRole('link', { name: 'Book 20 minutes' })
    ).toHaveAttribute('href', '/book')
    expect(
      screen.getByRole('link', { name: /See the deployment/ })
    ).toHaveAttribute('href', 'https://harbinger.finance/#deployment')
  })

  it('says where it runs without claiming the hosting for Harbinger', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByText(
        /the RoboSystems managed platform, a Dedicated Deployment RoboSystems runs, or your own cloud/
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/our managed platform/i)).not.toBeInTheDocument()
  })

  it('names the ledgers that connect and the partner route', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByText(
        /QuickBooks connects directly; any other ledger comes in through the API or a file/
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Integrators and consultancies: deliver the Finance AI/)
    ).toBeInTheDocument()
  })

  it('offers email when the booking hours do not suit', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByText(/Thursday or Friday afternoon not good\?/)
    ).toBeInTheDocument()
    expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Email us' }))
    expect(screen.getByTestId('contact-modal')).toHaveTextContent('Find a time')
  })
})
