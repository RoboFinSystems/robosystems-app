'use client'

import { ConfirmModal } from '@robosystems/core'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'flowbite-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { HiSave } from 'react-icons/hi'

export interface EditorModalProps {
  show: boolean
  /** Header title, e.g. "New Memory" / "Edit Document". */
  title: string
  /** flowbite Modal size — '3xl' (memory) / '7xl' (documents). */
  size?: string
  /**
   * Close request. When `dirty`, the shell intercepts it with a discard
   * confirmation; this only fires once the user confirms (or was clean).
   */
  onClose: () => void
  onSave: () => void
  saving?: boolean
  /** Caller-computed validity gate for the save button. */
  canSave?: boolean
  saveLabel?: string
  savingLabel?: string
  /** Marks unsaved changes — close attempts require confirmation. */
  dirty?: boolean
  /**
   * Pin the modal to the viewport height (instead of content-sized up to
   * the cap) and lay the body out as a flex column, so a `flex-1` editor
   * inside resizes with the browser window rather than scrolling.
   */
  fullHeight?: boolean
  /** Where the focus trap should land when the modal opens. */
  initialFocus?: React.MutableRefObject<HTMLElement | null>
  children: ReactNode
}

/**
 * The shared editor-modal shell for memory and document editing. Owns the
 * modal chrome, the Save/Cancel footer (both disabled while saving, spinner
 * in the save button — same contract as ConfirmModal), and the
 * unsaved-changes guard. `dismissible` stays unset so Escape/backdrop can't
 * bypass the guard; only the header X and Cancel route through it.
 */
export function EditorModal({
  show,
  title,
  size = '3xl',
  onClose,
  onSave,
  saving = false,
  canSave = true,
  saveLabel = 'Save',
  savingLabel = 'Saving...',
  dirty = false,
  fullHeight = false,
  initialFocus,
  children,
}: EditorModalProps) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  useEffect(() => {
    if (!show) setConfirmingDiscard(false)
  }, [show])

  const requestClose = () => {
    if (saving) return
    if (dirty) {
      setConfirmingDiscard(true)
      return
    }
    onClose()
  }

  return (
    <>
      <Modal
        show={show}
        size={size}
        onClose={requestClose}
        initialFocus={initialFocus}
        // twMerged onto the default inner classes (max-h-[90dvh] stays).
        theme={fullHeight ? { content: { inner: 'h-[90dvh]' } } : undefined}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className={fullHeight ? 'flex flex-col' : undefined}>
          {children}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onSave} disabled={saving || !canSave}>
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2 text-white" />
                {savingLabel}
              </>
            ) : (
              <>
                <HiSave className="mr-2 h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
          <Button color="gray" onClick={requestClose} disabled={saving}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        show={confirmingDiscard}
        onClose={() => setConfirmingDiscard(false)}
        onConfirm={() => {
          setConfirmingDiscard(false)
          onClose()
        }}
        title="Discard changes?"
        confirmLabel="Discard"
        loadingLabel="Discarding..."
        size="md"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You have unsaved changes. They will be lost if you close the editor.
        </p>
      </ConfirmModal>
    </>
  )
}
