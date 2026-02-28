import type { editor } from 'monaco-editor'

export const robosystemsTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: '3b82f6', fontStyle: 'bold' },
    { token: 'string', foreground: '818cf8' },
    { token: 'number', foreground: '10b981' },
    { token: 'type', foreground: '06b6d4' },
    { token: 'identifier', foreground: 'e5e7eb' },
    { token: 'delimiter', foreground: '9ca3af' },
    { token: 'operator', foreground: '60a5fa' },
  ],
  colors: {
    'editor.background': '#111827',
    'editor.foreground': '#e5e7eb',
    'editor.lineHighlightBackground': '#1f2937',
    'editor.selectionBackground': '#1e40af80',
    'editorCursor.foreground': '#3b82f6',
    'editorLineNumber.foreground': '#4b5563',
    'editorLineNumber.activeForeground': '#60a5fa',
    'editor.selectionHighlightBackground': '#1e3a8a40',
    'editorIndentGuide.background': '#374151',
    'editorIndentGuide.activeBackground': '#4b5563',
    'editorWhitespace.foreground': '#374151',
    'editorBracketMatch.background': '#1e40af40',
    'editorBracketMatch.border': '#3b82f6',
  },
}

export const monacoEditorOptions: editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    fontLigatures: true,
  }
