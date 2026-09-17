import { describe, expect, it } from 'vitest'
import { withoutLeadingTitle } from '../blog'

describe('withoutLeadingTitle', () => {
  it('drops a body that opens with its own H1', () => {
    expect(
      withoutLeadingTitle(
        '# Information Blocks: Turning Line Items Into Reports\n\nA ledger and a report.'
      )
    ).toBe('\nA ledger and a report.')
  })

  it('drops it after leading blank lines', () => {
    expect(withoutLeadingTitle('\n\n# Title\nBody')).toBe('Body')
  })

  it('keeps a body that opens with a section heading or prose', () => {
    expect(withoutLeadingTitle('## The Modern Data Stack\nBody')).toBe(
      '## The Modern Data Stack\nBody'
    )
    expect(withoutLeadingTitle('In 1494, Pacioli wrote.')).toBe(
      'In 1494, Pacioli wrote.'
    )
  })

  it('removes only the first heading, not a later H1', () => {
    expect(withoutLeadingTitle('Intro\n\n# Later')).toBe('Intro\n\n# Later')
  })
})
