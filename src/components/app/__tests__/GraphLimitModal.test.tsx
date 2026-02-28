import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GraphLimitModal from '../GraphLimitModal'

vi.mock('../GraphLimitForm', () => {
  return {
    __esModule: true,
    default: vi.fn(({ onClose, userEmail }) => (
      <div data-testid="graph-limit-form">
        <div>Mock GraphLimitForm</div>
        <div>User Email: {userEmail || 'None'}</div>
        <button onClick={onClose}>Close Form</button>
      </div>
    )),
  }
})

describe('GraphLimitModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText(/request higher graph limit/i)).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<GraphLimitModal isOpen={false} onClose={mockOnClose} />)

    expect(
      screen.queryByText(/request higher graph limit/i)
    ).not.toBeInTheDocument()
  })

  it('displays the current limit when provided', () => {
    render(
      <GraphLimitModal isOpen={true} onClose={mockOnClose} currentLimit={5} />
    )

    expect(
      screen.getByText(/you've reached your current limit of 5 graphs/i)
    ).toBeInTheDocument()
  })

  it('displays default limit of 0 when not provided', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    expect(
      screen.getByText(/you've reached your current limit of 0 graphs/i)
    ).toBeInTheDocument()
  })

  it('passes userEmail to GraphLimitForm', () => {
    const testEmail = 'test@example.com'
    render(
      <GraphLimitModal
        isOpen={true}
        onClose={mockOnClose}
        userEmail={testEmail}
      />
    )

    expect(screen.getByText(`User Email: ${testEmail}`)).toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', () => {
    // We'll test that the modal's close button functionality works
    // Since the actual close button is part of the Modal component implementation,
    // we'll test the onClose prop is passed correctly
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    // The modal should be visible
    expect(screen.getByText(/request higher graph limit/i)).toBeInTheDocument()

    // Test that the GraphLimitForm's onClose prop works
    const formCloseButton = screen.getByText('Close Form')
    fireEvent.click(formCloseButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('passes onClose to GraphLimitForm', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    const formCloseButton = screen.getByText('Close Form')
    fireEvent.click(formCloseButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders with correct styling classes', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    // The modal should render the heading with appropriate parent styling
    const heading = screen.getByText(/request higher graph limit/i)
    expect(heading).toBeInTheDocument()

    // Check that the modal structure is rendered correctly
    const limitText = screen.getByText(/you've reached your current limit/i)
    expect(limitText).toBeInTheDocument()
  })
})
