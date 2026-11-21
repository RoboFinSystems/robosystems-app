import { describe, expect, it } from 'vitest'
import { markedRegisterPath, parseTrialSource } from '../trial-source'

describe('trial source marker', () => {
  it.each(['research-msft', 'research-index', 'x-msft', 'sec-edgar-api', 'a1'])(
    'accepts the slug %s',
    (source) => {
      expect(parseTrialSource(source)).toBe(source)
    }
  )

  it.each([
    '',
    'Research-MSFT',
    'research_msft',
    '-research',
    'research-',
    'research--msft',
    'research msft',
    '%3Cscript%3E',
    'a'.repeat(49),
  ])('refuses %j', (source) => {
    expect(parseTrialSource(source)).toBeNull()
  })

  it('carries the marker to the register path', () => {
    expect(markedRegisterPath('research-msft')).toBe(
      '/register/from/research-msft'
    )
  })
})
