import { getAvailableExtensions } from '@robosystems/client'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SchemaExtensionsStep } from '../steps/SchemaExtensionsStep'

vi.mock('@robosystems/core', () => ({
  customTheme: {
    alert: {},
    card: {},
    checkbox: {},
  },
}))

const mockExtensions = [
  { name: 'roboledger', description: 'Accounting schema' },
  { name: 'roboinvestor', description: 'Portfolio schema' },
  { name: 'robohr', description: 'HR schema' },
]

function renderStep(allowedExtensions?: string[]) {
  return render(
    <SchemaExtensionsStep
      selectedExtensions={[]}
      requiredExtensions={[]}
      allowedExtensions={allowedExtensions}
      onExtensionsChange={vi.fn()}
    />
  )
}

describe('SchemaExtensionsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAvailableExtensions).mockResolvedValue({
      data: { extensions: mockExtensions },
    } as never)
  })

  it('renders every extension when no allowlist is given', async () => {
    renderStep()
    await waitFor(() => {
      expect(screen.getByText('roboledger')).toBeInTheDocument()
    })
    expect(screen.getByText('roboinvestor')).toBeInTheDocument()
    expect(screen.getByText('robohr')).toBeInTheDocument()
  })

  it('heads each card with the display name the API serves', async () => {
    vi.mocked(getAvailableExtensions).mockResolvedValue({
      data: {
        extensions: [
          {
            name: 'roboledger',
            display_name: 'RoboLedger - Accounting & Financial Reporting',
            description: 'Accounting schema',
          },
        ],
      },
    } as never)

    renderStep()

    await waitFor(() => {
      expect(
        screen.getByText('RoboLedger - Accounting & Financial Reporting')
      ).toBeInTheDocument()
    })
    // The slug is what the create path takes, not what a picker should show.
    expect(screen.queryByText('roboledger')).not.toBeInTheDocument()
  })

  it('names required extensions rather than listing their slugs', async () => {
    vi.mocked(getAvailableExtensions).mockResolvedValue({
      data: {
        extensions: [
          {
            name: 'roboledger',
            display_name: 'RoboLedger - Accounting & Financial Reporting',
            description: 'Accounting schema',
          },
        ],
      },
    } as never)

    render(
      <SchemaExtensionsStep
        selectedExtensions={['roboledger']}
        requiredExtensions={['roboledger']}
        onExtensionsChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(document.body.textContent).toContain(
        'cannot be deselected: RoboLedger - Accounting & Financial Reporting'
      )
    })
  })

  it('falls back to the slug against an API without display names', async () => {
    renderStep(['roboledger'])

    await waitFor(() => {
      expect(screen.getByText('roboledger')).toBeInTheDocument()
    })
  })

  it('narrows the list to the allowlist', async () => {
    renderStep(['roboledger', 'roboinvestor'])
    await waitFor(() => {
      expect(screen.getByText('roboledger')).toBeInTheDocument()
    })
    expect(screen.getByText('roboinvestor')).toBeInTheDocument()
    expect(screen.queryByText('robohr')).not.toBeInTheDocument()
  })

  // The filter used to be applied inside the fetch effect, whose dependency
  // list was empty and suppressed. That made the rendered list correct only
  // because the sole caller passed a constant — a caller that changed the
  // allowlist would have kept seeing the first one forever.
  it('re-narrows when the allowlist changes, without re-fetching', async () => {
    const { rerender } = renderStep(['roboledger'])

    await waitFor(() => {
      expect(screen.getByText('roboledger')).toBeInTheDocument()
    })
    expect(screen.queryByText('roboinvestor')).not.toBeInTheDocument()

    rerender(
      <SchemaExtensionsStep
        selectedExtensions={[]}
        requiredExtensions={[]}
        allowedExtensions={['roboinvestor']}
        onExtensionsChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('roboinvestor')).toBeInTheDocument()
    })
    expect(screen.queryByText('roboledger')).not.toBeInTheDocument()
    expect(getAvailableExtensions).toHaveBeenCalledTimes(1)
  })

  // Passed as an array literal by the only caller, so its identity changes on
  // every parent render. Depending on it would re-fetch each time.
  it('does not re-fetch when an equivalent allowlist is passed again', async () => {
    const { rerender } = renderStep(['roboledger', 'roboinvestor'])

    await waitFor(() => {
      expect(screen.getByText('roboledger')).toBeInTheDocument()
    })

    rerender(
      <SchemaExtensionsStep
        selectedExtensions={[]}
        requiredExtensions={[]}
        allowedExtensions={['roboledger', 'roboinvestor']}
        onExtensionsChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('roboinvestor')).toBeInTheDocument()
    })
    expect(getAvailableExtensions).toHaveBeenCalledTimes(1)
  })
})
