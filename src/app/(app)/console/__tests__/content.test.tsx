import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryInterfaceContent } from '../content'

// The graph-aware example selection (SEC / ledger / portfolio / generic) is
// exercised by the core graphAwareConfig.test.ts; here we only verify this app
// hands its branding to the shared hook and renders the resulting config.
const mockUseGraphAwareConsoleConfig = vi.fn()

vi.mock('@robosystems/core', async () => {
  const actual = await vi.importActual('@robosystems/core')
  return {
    ...actual,
    ConsoleContent: vi.fn(({ config }) => (
      <div data-testid="console-content">
        <h1>{config.header.title}</h1>
      </div>
    )),
    useGraphAwareConsoleConfig: (...args: any[]) =>
      mockUseGraphAwareConsoleConfig(...args),
  }
})

describe('QueryInterfaceContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGraphAwareConsoleConfig.mockReturnValue({
      header: { title: 'Console' },
    })
  })

  it('passes RoboSystems branding to the graph-aware config hook', () => {
    render(<QueryInterfaceContent />)

    expect(mockUseGraphAwareConsoleConfig).toHaveBeenCalledTimes(1)
    const branding = mockUseGraphAwareConsoleConfig.mock.calls[0][0]
    expect(branding.title).toBe('Console')
    expect(branding.consoleName).toBe('RoboSystems Console')
    expect(branding.mcp.serverName).toBe('robosystems')
    // The connector name is built from serverName + graph id; core's /mcp
    // serves the remote URL, so there is no npm package to name.
    expect(branding.mcp.packageName).toBeUndefined()
    // The parent app is brand-neutral — no example-set tiebreak.
    expect(branding.preferredKind).toBeUndefined()
  })

  it('renders the console with the resolved config', () => {
    render(<QueryInterfaceContent />)
    expect(screen.getByTestId('console-content')).toBeInTheDocument()
    expect(screen.getByText('Console')).toBeInTheDocument()
  })
})
