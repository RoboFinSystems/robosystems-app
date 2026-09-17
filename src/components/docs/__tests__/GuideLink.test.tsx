import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GuideLink } from '../GuideLink'

describe('GuideLink', () => {
  it('opens the guide in a new tab without handing it the app window', () => {
    render(<GuideLink href="/docs/guides/connect-an-mcp-client" />)
    const link = screen.getByRole('link', { name: /Read the guide/ })

    expect(link.getAttribute('href')).toBe('/docs/guides/connect-an-mcp-client')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('takes a label for pages that need different wording', () => {
    render(<GuideLink href="/docs/technical/quick-start" label="Quick start" />)

    expect(screen.getByRole('link', { name: /Quick start/ })).toBeDefined()
  })
})
