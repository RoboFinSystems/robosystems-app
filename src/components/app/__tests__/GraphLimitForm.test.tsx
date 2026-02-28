import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GraphLimitForm from '../GraphLimitForm'

// Mock the turnstile utilities
vi.mock('@/lib/config/turnstile', () => ({
  isTurnstileEnabled: vi.fn().mockReturnValue(false),
  isTurnstileValid: vi.fn().mockReturnValue(true),
}))

// Mock the TurnstileWidget component
vi.mock('@/lib/core/auth-components/TurnstileWidget', async () => {
  const React = await import('react')
  const MockTurnstileWidget = React.forwardRef((_props: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: vi.fn(),
    }))
    return <div data-testid="turnstile-widget">Turnstile Widget</div>
  })
  MockTurnstileWidget.displayName = 'MockTurnstileWidget'
  return { TurnstileWidget: MockTurnstileWidget }
})

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe('GraphLimitForm', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  it('renders the form with all required fields', () => {
    render(<GraphLimitForm onClose={mockOnClose} />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/how many graphs do you need/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/tell us about your use case/i)
    ).toBeInTheDocument()
  })

  it('pre-fills email when provided', () => {
    const testEmail = 'test@example.com'
    render(<GraphLimitForm onClose={mockOnClose} userEmail={testEmail} />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    expect(emailInput.value).toBe(testEmail)
  })

  it('updates form fields when user types', () => {
    render(<GraphLimitForm onClose={mockOnClose} />)

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    expect(nameInput.value).toBe('John Doe')

    const companyInput = screen.getByLabelText(/company/i) as HTMLInputElement
    fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })
    expect(companyInput.value).toBe('Acme Corp')
  })

  it('submits form with correct data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<GraphLimitForm onClose={mockOnClose} />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/how many graphs/i), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText(/use case/i), {
      target: { value: 'Building a multi-tenant application' },
    })

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: /request higher limit/i,
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    const fetchCall = mockFetch.mock.calls[0]
    expect(fetchCall[0]).toBe('/api/contact')
    expect(fetchCall[1].method).toBe('POST')
    expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' })

    const body = JSON.parse(fetchCall[1].body)
    expect(body.name).toBe('John Doe')
    expect(body.email).toBe('john@example.com')
    expect(body.company).toBe('Acme Corp')
    expect(body.message).toContain('[GRAPH LIMIT REQUEST]')
    expect(body.message).toContain('Graphs Needed: 50')
    expect(body.type).toBe('graph-limit-request')
  })

  it('shows success message after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<GraphLimitForm onClose={mockOnClose} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/how many graphs/i), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText(/use case/i), {
      target: { value: 'Test use case' },
    })

    // Submit
    fireEvent.click(
      screen.getByRole('button', { name: /request higher limit/i })
    )

    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeInTheDocument()
    })

    // Should call onClose after 2 seconds
    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })

  it('shows error message on submission failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<GraphLimitForm onClose={mockOnClose} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/how many graphs/i), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText(/use case/i), {
      target: { value: 'Test use case' },
    })

    // Submit
    fireEvent.click(
      screen.getByRole('button', { name: /request higher limit/i })
    )

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong. please try again later/i)
      ).toBeInTheDocument()
    })
  })

  it('handles cancel button click', () => {
    render(<GraphLimitForm onClose={mockOnClose} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('disables submit button while submitting', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 100)
        })
    )

    render(<GraphLimitForm onClose={mockOnClose} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/how many graphs/i), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText(/use case/i), {
      target: { value: 'Test use case' },
    })

    const submitButton = screen.getByRole('button', {
      name: /request higher limit/i,
    })
    fireEvent.click(submitButton)

    // Button should show "Submitting..." text
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
  })
})
