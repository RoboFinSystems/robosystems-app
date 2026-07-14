import { describe, expect, it } from 'vitest'
import { applyMarkdownCommand } from '../markdown-commands'

describe('applyMarkdownCommand', () => {
  describe('inline wraps (bold / italic / code)', () => {
    it('wraps a selection in bold markers and keeps it selected', () => {
      const result = applyMarkdownCommand(
        'hello world',
        { start: 0, end: 5 },
        'bold'
      )
      expect(result.text).toBe('**hello** world')
      expect(result.selection).toEqual({ start: 2, end: 7 })
    })

    it('places the caret between markers on an empty selection', () => {
      const result = applyMarkdownCommand('', { start: 0, end: 0 }, 'bold')
      expect(result.text).toBe('****')
      expect(result.selection).toEqual({ start: 2, end: 2 })
    })

    it('unwraps when the markers are inside the selection', () => {
      const result = applyMarkdownCommand(
        '**hello** world',
        { start: 0, end: 9 },
        'bold'
      )
      expect(result.text).toBe('hello world')
      expect(result.selection).toEqual({ start: 0, end: 5 })
    })

    it('unwraps when the markers sit just outside the selection', () => {
      const result = applyMarkdownCommand(
        '**hello** world',
        { start: 2, end: 7 },
        'bold'
      )
      expect(result.text).toBe('hello world')
      expect(result.selection).toEqual({ start: 0, end: 5 })
    })

    it('uses underscores for italic and backticks for code', () => {
      expect(
        applyMarkdownCommand('note', { start: 0, end: 4 }, 'italic').text
      ).toBe('_note_')
      expect(
        applyMarkdownCommand('note', { start: 0, end: 4 }, 'code').text
      ).toBe('`note`')
    })
  })

  describe('headings', () => {
    it('prefixes the caret line', () => {
      const result = applyMarkdownCommand(
        'title\nbody',
        { start: 2, end: 2 },
        'h2'
      )
      expect(result.text).toBe('## title\nbody')
      expect(result.selection).toEqual({ start: 5, end: 5 })
    })

    it('replaces an existing heading level', () => {
      const result = applyMarkdownCommand('# title', { start: 3, end: 3 }, 'h3')
      expect(result.text).toBe('### title')
    })

    it('toggles off when the line already has the target level', () => {
      const result = applyMarkdownCommand(
        '## title',
        { start: 4, end: 4 },
        'h2'
      )
      expect(result.text).toBe('title')
    })
  })

  describe('lists', () => {
    it('prefixes every selected line as a bullet list', () => {
      const result = applyMarkdownCommand(
        'one\ntwo\nthree',
        { start: 0, end: 13 },
        'ul'
      )
      expect(result.text).toBe('- one\n- two\n- three')
      expect(result.selection).toEqual({ start: 0, end: 19 })
    })

    it('numbers lines sequentially for ordered lists', () => {
      const result = applyMarkdownCommand(
        'one\ntwo\nthree',
        { start: 0, end: 13 },
        'ol'
      )
      expect(result.text).toBe('1. one\n2. two\n3. three')
    })

    it('converts between list styles', () => {
      const result = applyMarkdownCommand(
        '- one\n- two',
        { start: 0, end: 11 },
        'ol'
      )
      expect(result.text).toBe('1. one\n2. two')
    })

    it('toggles a list off', () => {
      const result = applyMarkdownCommand(
        '- one\n- two',
        { start: 0, end: 11 },
        'ul'
      )
      expect(result.text).toBe('one\ntwo')
    })

    it('excludes a line when the selection ends exactly at its start', () => {
      const result = applyMarkdownCommand(
        'one\ntwo',
        { start: 0, end: 4 },
        'ul'
      )
      expect(result.text).toBe('- one\ntwo')
    })
  })

  describe('links', () => {
    it('wraps the selection as the label and selects the url placeholder', () => {
      const result = applyMarkdownCommand(
        'docs here',
        { start: 0, end: 4 },
        'link'
      )
      expect(result.text).toBe('[docs](url) here')
      expect(
        result.text.slice(result.selection.start, result.selection.end)
      ).toBe('url')
    })

    it('inserts a placeholder label on an empty selection', () => {
      const result = applyMarkdownCommand('', { start: 0, end: 0 }, 'link')
      expect(result.text).toBe('[text](url)')
    })
  })

  describe('code blocks', () => {
    it('fences the selection', () => {
      const result = applyMarkdownCommand(
        'const x = 1',
        { start: 0, end: 11 },
        'codeblock'
      )
      expect(result.text).toBe('```\nconst x = 1\n```')
      expect(
        result.text.slice(result.selection.start, result.selection.end)
      ).toBe('const x = 1')
    })

    it('pads with newlines when inserted mid-text', () => {
      const result = applyMarkdownCommand(
        'before after',
        { start: 7, end: 7 },
        'codeblock'
      )
      expect(result.text).toBe('before \n```\n\n```\nafter')
    })
  })

  describe('tables', () => {
    it('inserts a 3-column template and selects the first header cell', () => {
      const result = applyMarkdownCommand('', { start: 0, end: 0 }, 'table')
      expect(result.text).toContain('| Column 1 | Column 2 | Column 3 |')
      expect(result.text).toContain('| --- | --- | --- |')
      expect(
        result.text.slice(result.selection.start, result.selection.end)
      ).toBe('Column 1')
    })

    it('sits on its own lines when inserted after text', () => {
      const result = applyMarkdownCommand(
        'intro',
        { start: 5, end: 5 },
        'table'
      )
      expect(result.text.startsWith('intro\n| Column 1')).toBe(true)
    })
  })
})
