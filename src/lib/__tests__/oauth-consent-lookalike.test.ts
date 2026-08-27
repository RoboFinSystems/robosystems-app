import { describe, expect, it } from 'vitest'
import { lookalikeBrand } from '../oauth-consent'

describe('lookalikeBrand', () => {
  it('matches known client names case-insensitively', () => {
    expect(lookalikeBrand('Claude')).toBe('Claude')
    expect(lookalikeBrand('Claude Code Helper')).toBe('Claude')
    expect(lookalikeBrand('chatgpt')).toBe('ChatGPT')
    expect(lookalikeBrand('Visual Studio Code')).toBe('Visual Studio Code')
    expect(lookalikeBrand('VS Code')).toBe('Visual Studio Code')
    expect(lookalikeBrand('Cursor')).toBe('Cursor')
  })

  it('does not match a bare "code" token or an unknown name', () => {
    expect(lookalikeBrand('research-test')).toBeNull()
    expect(lookalikeBrand('PromoCode')).toBeNull()
    expect(lookalikeBrand('code')).toBeNull()
    expect(lookalikeBrand('')).toBeNull()
  })
})
