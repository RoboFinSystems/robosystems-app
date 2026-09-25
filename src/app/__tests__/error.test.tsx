import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootError from '../error'

// The landing, blog and docs route groups had no error boundary, so a render
// error there fell back to Next's bare "Application error" screen.
describe('root error boundary', () => {
  it('offers a retry and a way home', () => {
    const reset = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<RootError error={new Error('boom')} reset={reset} />)

    fireEvent.click(screen.getByRole('button', { name: /Try Again/ }))
    expect(reset).toHaveBeenCalled()
    expect(screen.getByText(/Go back home/)).toBeInTheDocument()
  })
})
