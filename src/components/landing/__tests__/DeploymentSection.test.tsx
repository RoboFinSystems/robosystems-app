import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DeploymentSection from '../DeploymentSection'

vi.mock('../ContactModal', () => ({
  default: ({ isOpen, title }: { isOpen: boolean; title?: string }) =>
    isOpen ? <div data-testid="contact-modal">{title}</div> : null,
}))

describe('DeploymentSection', () => {
  it('names the offer, who delivers it, and the fixed price range', () => {
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
      screen.getByText('$7,500 to $10,000, fixed by scope')
    ).toBeInTheDocument()
    expect(
      screen.getByText('You keep everything we build.')
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

  it('says the offer runs on the deployment the client chooses', () => {
    render(<DeploymentSection />)

    expect(
      screen.getByText(
        /our managed platform, a Dedicated Deployment, or self-hosted in your own cloud/
      )
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
