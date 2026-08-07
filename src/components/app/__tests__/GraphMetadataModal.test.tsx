import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GraphMetadataModal from '../GraphMetadataModal'

const mockSDK = vi.hoisted(() => ({
  updateGraphMetadata: vi.fn(),
}))

const mockHandleApiError = vi.hoisted(() => vi.fn())
const mockShowSuccess = vi.hoisted(() => vi.fn())

vi.mock('@robosystems/client', () => mockSDK)

vi.mock('@robosystems/core', () => ({
  useApiError: () => ({ handleApiError: mockHandleApiError }),
  useToast: () => ({ showSuccess: mockShowSuccess, showError: vi.fn() }),
}))

const defaultProps = {
  show: true,
  onClose: vi.fn(),
  graphId: 'kg123',
  graphName: 'Test Graph',
  description: 'Original description',
  tags: ['alpha', 'beta'],
}

const nameField = () => screen.getByLabelText('Name') as HTMLInputElement
const descField = () =>
  screen.getByLabelText('Description') as HTMLTextAreaElement
const tagsField = () => screen.getByLabelText('Tags') as HTMLInputElement
const saveButton = () => screen.getByRole('button', { name: /save changes/i })

describe('GraphMetadataModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSDK.updateGraphMetadata.mockResolvedValue({
      data: { operation: 'update-graph-metadata', status: 'completed' },
    })
  })

  it('seeds the form from the current values', () => {
    render(<GraphMetadataModal {...defaultProps} />)

    expect(nameField().value).toBe('Test Graph')
    expect(descField().value).toBe('Original description')
    expect(tagsField().value).toBe('alpha, beta')
  })

  it('disables save until something changes', () => {
    render(<GraphMetadataModal {...defaultProps} />)

    expect(saveButton()).toBeDisabled()

    fireEvent.change(nameField(), { target: { value: 'Renamed' } })

    expect(saveButton()).not.toBeDisabled()
  })

  it('sends the trimmed name and parsed tags', async () => {
    render(<GraphMetadataModal {...defaultProps} />)

    fireEvent.change(nameField(), { target: { value: '  Renamed  ' } })
    fireEvent.change(tagsField(), {
      target: { value: ' gamma , delta ,, gamma ' },
    })
    fireEvent.click(saveButton())

    await waitFor(() => expect(mockSDK.updateGraphMetadata).toHaveBeenCalled())
    expect(mockSDK.updateGraphMetadata).toHaveBeenCalledWith({
      path: { graph_id: 'kg123' },
      body: {
        graph_name: 'Renamed',
        description: 'Original description',
        tags: ['gamma', 'delta'],
      },
    })
  })

  it('sends empty values when the user clears description and tags', async () => {
    render(<GraphMetadataModal {...defaultProps} />)

    fireEvent.change(descField(), { target: { value: '' } })
    fireEvent.change(tagsField(), { target: { value: '' } })
    fireEvent.click(saveButton())

    await waitFor(() => expect(mockSDK.updateGraphMetadata).toHaveBeenCalled())
    expect(mockSDK.updateGraphMetadata.mock.calls[0][0].body).toEqual({
      graph_name: 'Test Graph',
      description: '',
      tags: [],
    })
  })

  it('blocks save on a blank name', () => {
    render(<GraphMetadataModal {...defaultProps} />)

    fireEvent.change(nameField(), { target: { value: '   ' } })

    expect(saveButton()).toBeDisabled()
  })

  it('blocks save on more than twenty tags', () => {
    render(<GraphMetadataModal {...defaultProps} />)

    const tooMany = Array.from({ length: 21 }, (_, i) => `tag${i}`).join(', ')
    fireEvent.change(tagsField(), { target: { value: tooMany } })

    expect(saveButton()).toBeDisabled()
  })

  it('notifies, refreshes and closes on success', async () => {
    const onSaved = vi.fn()
    const onClose = vi.fn()
    render(
      <GraphMetadataModal
        {...defaultProps}
        onSaved={onSaved}
        onClose={onClose}
      />
    )

    fireEvent.change(nameField(), { target: { value: 'Renamed' } })
    fireEvent.click(saveButton())

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mockShowSuccess).toHaveBeenCalledWith('Graph details updated')
    expect(onSaved).toHaveBeenCalled()
  })

  it('surfaces the API error detail and stays open', async () => {
    mockSDK.updateGraphMetadata.mockResolvedValue({
      error: { detail: 'Admin access to graph kg123 is required' },
    })
    const onClose = vi.fn()
    render(<GraphMetadataModal {...defaultProps} onClose={onClose} />)

    fireEvent.change(nameField(), { target: { value: 'Renamed' } })
    fireEvent.click(saveButton())

    await waitFor(() => expect(mockHandleApiError).toHaveBeenCalled())
    expect(mockHandleApiError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect((mockHandleApiError.mock.calls[0][0] as Error).message).toBe(
      'Admin access to graph kg123 is required'
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('re-seeds the form when reopened after a cancelled edit', () => {
    const { rerender } = render(<GraphMetadataModal {...defaultProps} />)

    fireEvent.change(nameField(), { target: { value: 'Abandoned' } })
    rerender(<GraphMetadataModal {...defaultProps} show={false} />)
    rerender(<GraphMetadataModal {...defaultProps} show={true} />)

    expect(nameField().value).toBe('Test Graph')
  })
})
