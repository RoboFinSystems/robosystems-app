import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MarkdownEditor } from '../MarkdownEditor'

// @monaco-editor/react is aliased to a stub (vitest.config.ts) that renders
// a textarea[data-testid="monaco-editor"] and implements enough of the
// editor/model surface for toolbar commands to round-trip.

function Harness({
  initial = '',
  onChange,
  ...rest
}: {
  initial?: string
  onChange?: (v: string) => void
  maxLength?: number
}) {
  const [value, setValue] = useState(initial)
  return (
    <MarkdownEditor
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      heightClassName="h-72"
      {...rest}
    />
  )
}

describe('MarkdownEditor', () => {
  it('renders the Monaco pane and propagates typing', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    const editor = await screen.findByTestId('monaco-editor')
    fireEvent.change(editor, { target: { value: '# Hello' } })
    expect(onChange).toHaveBeenLastCalledWith('# Hello')
  })

  it('switches to the preview tab and renders the markdown source', async () => {
    render(<Harness initial="# Hello preview" />)

    await screen.findByTestId('monaco-editor')
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }))

    // react-markdown is mocked to render the raw source.
    expect(screen.getByText('# Hello preview')).toBeInTheDocument()
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Write' }))
    expect(await screen.findByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('shows a placeholder when previewing empty content', async () => {
    render(<Harness />)
    await screen.findByTestId('monaco-editor')
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }))
    expect(screen.getByText('Nothing to preview.')).toBeInTheDocument()
  })

  it('renders the character counter and flags over-limit values', async () => {
    render(<Harness initial="12345" maxLength={4} />)
    await screen.findByTestId('monaco-editor')

    const counter = screen.getByText('5 / 4')
    expect(counter.className).toContain('text-red-500')
  })

  it('keeps the counter neutral under the limit', async () => {
    render(<Harness initial="123" maxLength={4} />)
    await screen.findByTestId('monaco-editor')

    const counter = screen.getByText('3 / 4')
    expect(counter.className).not.toContain('text-red-500')
  })

  it('applies toolbar commands through the editor', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await screen.findByTestId('monaco-editor')
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    // Empty selection at the origin: bold inserts its markers.
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('****'))
  })

  it('applies heading commands to the current line', async () => {
    const onChange = vi.fn()
    render(<Harness initial="title" onChange={onChange} />)

    await screen.findByTestId('monaco-editor')
    fireEvent.click(screen.getByRole('button', { name: 'Heading 1' }))
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('# title'))
  })

  it('hides the toolbar in preview mode', async () => {
    render(<Harness />)
    await screen.findByTestId('monaco-editor')
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }))
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })
})
