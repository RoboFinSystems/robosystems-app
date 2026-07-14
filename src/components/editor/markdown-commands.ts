/**
 * Pure markdown formatting commands for the toolbar in MarkdownEditor.
 * Operates on plain text + absolute offsets so it stays Monaco-free and
 * fully unit-testable; the editor applies the result via executeEdits.
 */

export interface TextSelection {
  start: number
  end: number
}

export type MarkdownCommandId =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'link'
  | 'code'
  | 'codeblock'
  | 'table'

export interface CommandResult {
  text: string
  selection: TextSelection
}

const TABLE_TEMPLATE =
  '| Column 1 | Column 2 | Column 3 |\n' +
  '| --- | --- | --- |\n' +
  '|  |  |  |\n' +
  '|  |  |  |'

/** Wraps/unwraps the selection with an inline marker (** / _ / `). */
function toggleWrap(
  text: string,
  { start, end }: TextSelection,
  marker: string
): CommandResult {
  const selected = text.slice(start, end)
  const m = marker.length

  // Unwrap when the markers are inside the selection: "**bold**" selected.
  if (
    selected.length >= 2 * m &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const inner = selected.slice(m, selected.length - m)
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      selection: { start, end: start + inner.length },
    }
  }

  // Unwrap when the markers sit just outside the selection: **|bold|**.
  if (
    text.slice(start - m, start) === marker &&
    text.slice(end, end + m) === marker
  ) {
    return {
      text: text.slice(0, start - m) + selected + text.slice(end + m),
      selection: { start: start - m, end: end - m },
    }
  }

  // Wrap. Empty selection leaves the caret between the markers.
  const wrapped = marker + selected + marker
  return {
    text: text.slice(0, start) + wrapped + text.slice(end),
    selection: { start: start + m, end: end + m },
  }
}

/** Start offset of the line containing `offset`. */
function lineStartAt(text: string, offset: number): number {
  return text.lastIndexOf('\n', offset - 1) + 1
}

/** End offset (exclusive of the newline) of the line containing `offset`. */
function lineEndAt(text: string, offset: number): number {
  const idx = text.indexOf('\n', offset)
  return idx === -1 ? text.length : idx
}

/**
 * Toggles a per-line prefix across every line the selection touches.
 * If all touched lines already carry the target prefix it is removed;
 * otherwise any existing block prefix is replaced with the target.
 */
function toggleLinePrefixes(
  text: string,
  { start, end }: TextSelection,
  matchPrefix: RegExp,
  stripPrefix: RegExp,
  makePrefix: (lineIndex: number) => string
): CommandResult {
  // A selection ending exactly at a line start does not include that line.
  const effectiveEnd =
    end > start && (end === 0 || text[end - 1] === '\n') ? end - 1 : end

  const blockStart = lineStartAt(text, start)
  const blockEnd = lineEndAt(text, effectiveEnd)
  const lines = text.slice(blockStart, blockEnd).split('\n')

  const allMatch = lines.every((line) => matchPrefix.test(line))
  const newLines = lines.map((line, i) =>
    allMatch
      ? line.replace(matchPrefix, '')
      : makePrefix(i) + line.replace(stripPrefix, '')
  )

  const newBlock = newLines.join('\n')
  const newText = text.slice(0, blockStart) + newBlock + text.slice(blockEnd)

  if (start === end) {
    // Caret only: keep it on the same line, shifted by the prefix delta.
    const delta = newLines[0].length - lines[0].length
    const caret = Math.max(blockStart, start + delta)
    return { text: newText, selection: { start: caret, end: caret } }
  }
  return {
    text: newText,
    selection: { start: blockStart, end: blockStart + newBlock.length },
  }
}

/** Inserts a block snippet, padding with newlines to sit on its own lines. */
function insertBlock(
  text: string,
  { start, end }: TextSelection,
  block: string,
  innerSelection: TextSelection
): CommandResult {
  const needsLeadingBreak = start > 0 && text[start - 1] !== '\n'
  const needsTrailingBreak = end < text.length && text[end] !== '\n'
  const prefix = needsLeadingBreak ? '\n' : ''
  const suffix = needsTrailingBreak ? '\n' : ''

  return {
    text: text.slice(0, start) + prefix + block + suffix + text.slice(end),
    selection: {
      start: start + prefix.length + innerSelection.start,
      end: start + prefix.length + innerSelection.end,
    },
  }
}

export function applyMarkdownCommand(
  text: string,
  selection: TextSelection,
  command: MarkdownCommandId
): CommandResult {
  const { start, end } = selection
  const selected = text.slice(start, end)

  switch (command) {
    case 'bold':
      return toggleWrap(text, selection, '**')
    case 'italic':
      return toggleWrap(text, selection, '_')
    case 'code':
      return toggleWrap(text, selection, '`')

    case 'h1':
    case 'h2':
    case 'h3': {
      const level = Number(command[1])
      const hashes = '#'.repeat(level)
      return toggleLinePrefixes(
        text,
        selection,
        new RegExp(`^${hashes} `),
        /^#{1,6} /,
        () => `${hashes} `
      )
    }

    case 'ul':
      return toggleLinePrefixes(
        text,
        selection,
        /^- /,
        /^(?:[-*+] |\d+\. )/,
        () => '- '
      )

    case 'ol':
      return toggleLinePrefixes(
        text,
        selection,
        /^\d+\. /,
        /^(?:[-*+] |\d+\. )/,
        (i) => `${i + 1}. `
      )

    case 'link': {
      const label = selected || 'text'
      const snippet = `[${label}](url)`
      // Select the url placeholder so the user can type over it.
      const urlStart = start + 1 + label.length + 2
      return {
        text: text.slice(0, start) + snippet + text.slice(end),
        selection: { start: urlStart, end: urlStart + 3 },
      }
    }

    case 'codeblock': {
      const block = '```\n' + selected + '\n```'
      return insertBlock(text, selection, block, {
        start: 4,
        end: 4 + selected.length,
      })
    }

    case 'table': {
      // Select the first header cell so the user can start typing.
      const cellStart = TABLE_TEMPLATE.indexOf('Column 1')
      return insertBlock(text, selection, TABLE_TEMPLATE, {
        start: cellStart,
        end: cellStart + 'Column 1'.length,
      })
    }
  }
}
