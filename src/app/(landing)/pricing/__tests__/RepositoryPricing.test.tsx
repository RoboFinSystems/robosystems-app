import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RepositoryPricing from '../RepositoryPricing'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe('RepositoryPricing', () => {
  it('leads a visitor to the free trial and says what it covers', () => {
    render(
      <RepositoryPricing isAuthenticated={false} onContactSales={vi.fn()} />
    )

    expect(
      screen.getByText('Start with a 14-day free trial on either plan')
    ).toBeInTheDocument()
    expect(screen.getAllByText('after a 14-day free trial')).toHaveLength(2)
    expect(screen.getByText(/A card is required/)).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', {
      name: 'Start Free Trial',
    })) {
      expect(link).toHaveAttribute('href', '/register')
    }
  })

  it('sends a signed-in visitor to the subscribe screen', () => {
    render(<RepositoryPricing isAuthenticated onContactSales={vi.fn()} />)

    expect(
      screen.getAllByRole('link', { name: 'Browse Repositories' })
    ).toHaveLength(2)
  })
})
