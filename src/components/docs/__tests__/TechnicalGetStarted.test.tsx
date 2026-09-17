import { MCP_API_URL, MCP_CONNECTOR_NAME, MCP_OAUTH_URL } from '@/lib/mcp'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  GET_STARTED_HEADINGS,
  TechnicalGetStarted,
} from '../TechnicalGetStarted'

describe('TechnicalGetStarted', () => {
  it('renders every heading the on-this-page list links to', () => {
    const { container } = render(<TechnicalGetStarted />)
    for (const { id, text } of GET_STARTED_HEADINGS) {
      expect(container.querySelector(`#${id}`)?.textContent).toBe(text)
    }
  })

  it('takes the MCP addresses from @/lib/mcp', () => {
    const { container } = render(<TechnicalGetStarted />)
    const code = Array.from(container.querySelectorAll('pre code')).map(
      (c) => c.textContent
    )
    expect(code).toContain(MCP_OAUTH_URL)
    expect(code).toContain(
      `claude mcp add --transport http ${MCP_CONNECTOR_NAME} ${MCP_OAUTH_URL}`
    )
    expect(
      code.some((c) => c?.startsWith(`URL:    ${MCP_API_URL}/v1/graphs/`))
    ).toBe(true)
  })

  it('loads SEC filings with a placeholder ticker, not a named company', () => {
    const { container } = render(<TechnicalGetStarted />)
    expect(container.textContent).toContain('just sec-load <TICKER>')
  })

  it('links each topic to the technical docs page that owns it', () => {
    const { container } = render(<TechnicalGetStarted />)
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    )
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/docs/technical/quick-start',
        '/docs/technical/sec-xbrl-pipeline',
        '/docs/technical/ai-operators-and-mcp',
        '/docs/technical/building-custom-integrations',
        '/docs/technical/bootstrap-guide',
      ])
    )
  })
})
