import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutContent from '../content'

vi.mock('@/components/landing/Header', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/components/landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}))
vi.mock('@/components/landing/FloatingElementsVariant', () => ({
  default: () => null,
}))
vi.mock('@/components/landing/ContactModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="contact-modal" /> : null,
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

describe('AboutContent', () => {
  it('names the founder and the operating company', () => {
    render(<AboutContent />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Joseph T. French' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/built and operated by RFS LLC/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Harbinger FinLab' })
    ).toHaveAttribute('href', 'https://harbinger.finance')
  })

  it('states SOC 2 Type II as in progress, never as completed or certified', () => {
    render(<AboutContent />)

    expect(
      screen.getByText(/SOC 2 Type II compliance in progress/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/certified/i)).not.toBeInTheDocument()
  })

  it('states ownership as a present fact, never as a promise not to raise', () => {
    render(<AboutContent />)

    expect(screen.getByText(/no outside investors/)).toBeInTheDocument()
    expect(screen.queryByText(/not raising/i)).not.toBeInTheDocument()
  })

  it('opens the contact modal', () => {
    render(<AboutContent />)

    expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Talk to us' }))
    expect(screen.getByTestId('contact-modal')).toBeInTheDocument()
  })
})
