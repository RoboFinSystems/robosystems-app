import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PilotSection from '../PilotSection'

vi.mock('../ContactModal', () => ({
  default: ({ isOpen, title }: { isOpen: boolean; title?: string }) =>
    isOpen ? <div data-testid="contact-modal">{title}</div> : null,
}))

describe('PilotSection', () => {
  it('names the offer, who delivers it, and the fixed price range', () => {
    render(<PilotSection />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'The Finance AI Pilot' })
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

  it('books through /book and links the pilot page', () => {
    render(<PilotSection />)

    expect(
      screen.getByRole('link', { name: 'Book 20 minutes' })
    ).toHaveAttribute('href', '/book')
    expect(screen.getByRole('link', { name: /See the pilot/ })).toHaveAttribute(
      'href',
      'https://harbinger.finance'
    )
  })

  it('offers email when the booking hours do not suit', () => {
    render(<PilotSection />)

    expect(
      screen.getByText(/Thursday or Friday afternoon not good\?/)
    ).toBeInTheDocument()
    expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Email us' }))
    expect(screen.getByTestId('contact-modal')).toHaveTextContent('Find a time')
  })
})
