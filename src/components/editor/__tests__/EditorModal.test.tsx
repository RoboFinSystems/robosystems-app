import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorModal } from '../EditorModal'

// Rendered with the real flowbite Modal and core ConfirmModal — queries
// work across the portal.

function renderModal(props: Partial<React.ComponentProps<typeof EditorModal>>) {
  const onClose = vi.fn()
  const onSave = vi.fn()
  render(
    <EditorModal
      show
      title="Edit Thing"
      onClose={onClose}
      onSave={onSave}
      {...props}
    >
      <p>form body</p>
    </EditorModal>
  )
  return { onClose, onSave }
}

describe('EditorModal', () => {
  it('renders the title, body, and footer actions', () => {
    renderModal({ saveLabel: 'Remember' })
    expect(screen.getByText('Edit Thing')).toBeInTheDocument()
    expect(screen.getByText('form body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Remember/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('invokes onSave from the save button and gates it on canSave', () => {
    const { onSave } = renderModal({ canSave: false })
    const saveButton = screen.getByRole('button', { name: /Save/ })
    expect(saveButton).toBeDisabled()
    fireEvent.click(saveButton)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows the saving state and blocks closing while saving', () => {
    const { onClose } = renderModal({ saving: true, dirty: false })
    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled()
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    expect(cancel).toBeDisabled()
    fireEvent.click(cancel)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes directly when clean', () => {
    const { onClose } = renderModal({ dirty: false })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('intercepts close with a discard confirmation when dirty', () => {
    const { onClose } = renderModal({ dirty: true })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Discard changes?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Discard/ }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps the editor open when the discard confirmation is cancelled', () => {
    const { onClose } = renderModal({ dirty: true })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Discard changes?')).toBeInTheDocument()

    // The discard dialog's own cancel button.
    const cancels = screen.getAllByRole('button', { name: 'Cancel' })
    fireEvent.click(cancels[cancels.length - 1])

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument()
    expect(screen.getByText('form body')).toBeInTheDocument()
  })
})
