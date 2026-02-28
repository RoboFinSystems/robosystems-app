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

  it('renders "Request Graph Access" when currentLimit is 0', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText(/request graph access/i)).toBeInTheDocument()
    expect(
      screen.getByText(/graph creation requires approval/i)
    ).toBeInTheDocument()
  })

  it('renders "Request Higher Graph Limit" when currentLimit > 0', () => {
    render(
      <GraphLimitModal isOpen={true} onClose={mockOnClose} currentLimit={5} />
    )

    expect(screen.getByText(/request higher graph limit/i)).toBeInTheDocument()
    expect(
      screen.getByText(/you've reached your current limit of 5 graphs/i)
    ).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<GraphLimitModal isOpen={false} onClose={mockOnClose} />)

    expect(screen.queryByText(/request graph access/i)).not.toBeInTheDocument()
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

  it('calls onClose when form close button is clicked', () => {
    render(<GraphLimitModal isOpen={true} onClose={mockOnClose} />)

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
})
