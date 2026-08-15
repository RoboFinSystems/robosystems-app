import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DedicatedDeployment from '../DedicatedDeployment'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe('DedicatedDeployment', () => {
  it('shows no price — the quote is per engagement', () => {
    render(<DedicatedDeployment onContactSales={vi.fn()} />)

    expect(screen.getByText('Dedicated Deployment')).toBeInTheDocument()
    expect(screen.getByText('quoted per engagement')).toBeInTheDocument()
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument()
  })

  it('opens the sales conversation and links to the comparison page', () => {
    const onContactSales = vi.fn()
    render(<DedicatedDeployment onContactSales={onContactSales} />)

    fireEvent.click(screen.getByRole('button', { name: 'Talk to us' }))
    expect(onContactSales).toHaveBeenCalledTimes(1)

    expect(
      screen.getByRole('link', { name: /Compare deployment options/ })
    ).toHaveAttribute('href', '/enterprise')
  })
})
