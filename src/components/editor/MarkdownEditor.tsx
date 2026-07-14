'use client'

import { monacoEditorOptions, robosystemsTheme } from '@/lib/monaco-theme'
import type { Monaco } from '@monaco-editor/react'
import { MarkdownProse } from '@robosystems/core'
import type { editor } from 'monaco-editor'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import type { IconType } from 'react-icons'
import {
  LuBold,
  LuCode,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
  LuSquareCode,
  LuTable,
} from 'react-icons/lu'

import type { MarkdownCommandId } from './markdown-commands'
import { applyMarkdownCommand } from './markdown-commands'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  /**
   * Tailwind height class for the editor/preview area, e.g. 'h-72'.
   * Monaco needs an explicit-height container — against an auto-height
   * flex parent it renders 0px tall. Ignored when `fill` is set.
   */
  heightClassName?: string
  /**
   * Fill the parent instead of using a fixed pane height: the editor
   * stretches to `h-full` and the Write/Preview pane flexes, so it
   * resizes with the surrounding modal/window. The parent must have a
   * determinate height (e.g. a `flex-1 min-h-0` slot in a sized column).
   */
  fill?: boolean
  /** Renders a live character counter that turns red over the limit. */
  maxLength?: number
  /** Typography scale of the preview tab. */
  previewSize?: 'sm' | 'base'
  lineNumbers?: 'on' | 'off'
  /** Focus the Monaco pane once it mounts (e.g. as a modal's main field). */
  focusOnMount?: boolean
  id?: string
}

const TOOLBAR: { command: MarkdownCommandId; icon: IconType; label: string }[] =
  [
    { command: 'bold', icon: LuBold, label: 'Bold' },
    { command: 'italic', icon: LuItalic, label: 'Italic' },
    { command: 'h1', icon: LuHeading1, label: 'Heading 1' },
    { command: 'h2', icon: LuHeading2, label: 'Heading 2' },
    { command: 'h3', icon: LuHeading3, label: 'Heading 3' },
    { command: 'ul', icon: LuList, label: 'Bullet list' },
    { command: 'ol', icon: LuListOrdered, label: 'Numbered list' },
    { command: 'link', icon: LuLink, label: 'Link' },
    { command: 'code', icon: LuCode, label: 'Inline code' },
    { command: 'codeblock', icon: LuSquareCode, label: 'Code block' },
    { command: 'table', icon: LuTable, label: 'Table' },
  ]

function setupMonacoTheme(monaco: Monaco) {
  monaco.editor.defineTheme('robosystems', robosystemsTheme)
  monaco.editor.setTheme('robosystems')
}

/**
 * The standardized markdown input: Write/Preview tabs, a formatting
 * toolbar, and a Monaco pane themed like the rest of the app. Preview
 * renders through the shared MarkdownProse, so what you see here is what
 * the viewer surfaces show.
 */
export function MarkdownEditor({
  value,
  onChange,
  heightClassName = 'h-72',
  fill = false,
  maxLength,
  previewSize = 'base',
  lineNumbers = 'on',
  focusOnMount = false,
  id,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleCommand = (command: MarkdownCommandId) => {
    const codeEditor = editorRef.current
    const model = codeEditor?.getModel()
    const monacoSelection = codeEditor?.getSelection()
    if (!codeEditor || !model || !monacoSelection) return

    const start = model.getOffsetAt({
      lineNumber: monacoSelection.startLineNumber,
      column: monacoSelection.startColumn,
    })
    const end = model.getOffsetAt({
      lineNumber: monacoSelection.endLineNumber,
      column: monacoSelection.endColumn,
    })

    const result = applyMarkdownCommand(
      model.getValue(),
      { start, end },
      command
    )

    // executeEdits (not setValue) so the change lands on the undo stack.
    codeEditor.executeEdits('markdown-toolbar', [
      { range: model.getFullModelRange(), text: result.text },
    ])

    const selStart = model.getPositionAt(result.selection.start)
    const selEnd = model.getPositionAt(result.selection.end)
    codeEditor.setSelection({
      startLineNumber: selStart.lineNumber,
      startColumn: selStart.column,
      endLineNumber: selEnd.lineNumber,
      endColumn: selEnd.column,
    })
    codeEditor.focus()
  }

  const overLimit = maxLength !== undefined && value.length > maxLength

  const tabClass = (active: boolean) =>
    `border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    }`

  const paneClass = fill ? 'min-h-0 flex-1' : heightClassName

  return (
    <div
      id={id}
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${
        fill ? 'flex h-full min-h-0 flex-col' : ''
      }`}
    >
      {/* Tabs + counter */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-2 dark:border-gray-700 dark:bg-zinc-800">
        <div role="tablist" aria-label="Editor mode" className="flex">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'write'}
            className={tabClass(tab === 'write')}
            onClick={() => setTab('write')}
          >
            Write
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            className={tabClass(tab === 'preview')}
            onClick={() => setTab('preview')}
          >
            Preview
          </button>
        </div>
        {maxLength !== undefined && (
          <span
            className={`px-2 text-xs ${
              overLimit ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        )}
      </div>

      {tab === 'write' ? (
        <>
          {/* Toolbar */}
          <div
            role="toolbar"
            aria-label="Formatting"
            className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-700 dark:bg-zinc-800"
          >
            {TOOLBAR.map(({ command, icon: Icon, label }) => (
              <button
                key={command}
                type="button"
                title={label}
                aria-label={label}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-100"
                onClick={() => handleCommand(command)}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className={paneClass}>
            <Editor
              height="100%"
              language="markdown"
              value={value}
              onChange={(next) => onChange(next || '')}
              beforeMount={setupMonacoTheme}
              onMount={(codeEditor) => {
                editorRef.current = codeEditor
                if (focusOnMount) codeEditor.focus()
              }}
              options={{ ...monacoEditorOptions, lineNumbers }}
            />
          </div>
        </>
      ) : (
        <div
          className={`${paneClass} overflow-y-auto bg-white px-4 py-3 dark:bg-zinc-900`}
        >
          {value.trim() ? (
            <MarkdownProse size={previewSize}>{value}</MarkdownProse>
          ) : (
            <p className="text-sm text-gray-400">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
