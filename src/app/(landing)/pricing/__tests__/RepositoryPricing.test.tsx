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
    expect(screen.getByText(/No card is needed to start/)).toBeInTheDocument()
    expect(screen.queryByText(/A card is required/)).toBeNull()
    for (const link of screen.getAllByRole('link', {
      name: 'Start free trial',
    })) {
      expect(link).toHaveAttribute('href', '/register')
    }
  })

  it('carries a source marker on to the register page', () => {
    render(
      <RepositoryPricing
        isAuthenticated={false}
        registerHref="/register/from/research-msft"
        onContactSales={vi.fn()}
      />
    )

    for (const link of screen.getAllByRole('link', {
      name: 'Start free trial',
    })) {
      expect(link).toHaveAttribute('href', '/register/from/research-msft')
    }
  })

  it('sends a signed-in visitor to the subscribe screen', () => {
    render(<RepositoryPricing isAuthenticated onContactSales={vi.fn()} />)

    expect(
      screen.getAllByRole('link', { name: 'Browse Repositories' })
    ).toHaveLength(2)
  })
})
