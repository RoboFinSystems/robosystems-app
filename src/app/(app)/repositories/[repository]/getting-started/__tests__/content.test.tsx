import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ApiKeysContent } from '../content'

vi.mock('@robosystems/client/sdk', () => ({
  createUserApiKey: vi.fn(),
}))

vi.mock('@robosystems/core', () => ({
  useGraphContext: () => ({ setCurrentGraph: vi.fn() }),
  useServiceOfferings: () => ({
    offerings: {
      repositoryPlans: {
        sec: { name: 'SEC EDGAR Filings', description: 'Public filings' },
      },
    },
  }),
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    ToastContainer: () => null,
  }),
  PageLayout: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('react-icons/hi', () => ({
  HiCheck: () => <span>Icon</span>,
  HiCheckCircle: () => <span>Icon</span>,
  HiClipboardCopy: () => <span>Icon</span>,
  HiCreditCard: () => <span>Icon</span>,
  HiDatabase: () => <span>Icon</span>,
  HiKey: () => <span>Icon</span>,
  HiLightningBolt: () => <span>Icon</span>,
  HiTerminal: () => <span>Icon</span>,
}))

vi.mock('flowbite-react', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Spinner: () => <span>Loading</span>,
}))

describe('ApiKeysContent — MCP', () => {
  test('leads with the universal sign-in, then the repository-pinned key recipes', () => {
    render(<ApiKeysContent repository="sec" />)

    const signIn = screen.getByTestId('mcp-sign-in')
    const withKey = screen.getByTestId('mcp-api-key')

    // Universal first: the listing name and URL — no repository id, no header.
    expect(signIn.textContent).toContain(
      'claude mcp add --transport http robosystems https://api.robosystems.ai/v1/mcp'
    )
    expect(signIn.textContent).toContain(
      '"robosystems": { "url": "https://api.robosystems.ai/v1/mcp" }'
    )
    expect(signIn.textContent).not.toContain('/v1/graphs/')
    expect(signIn.textContent).not.toContain('X-API-Key')

    // The key recipes pin the URL to this repository and carry the key in a
    // header; /v1/mcp is OAuth-only on the API, so it never appears here.
    expect(withKey.textContent).toContain(
      'https://api.robosystems.ai/v1/graphs/sec/mcp'
    )
    expect(withKey.textContent).toContain('robosystems-sec')
    expect(withKey.textContent).toContain('X-API-Key: YOUR_API_KEY_HERE')
    expect(withKey.textContent).not.toContain('api.robosystems.ai/v1/mcp')

    expect(
      signIn.compareDocumentPosition(withKey) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  test('names the repository to choose on the consent screen', () => {
    render(<ApiKeysContent repository="sec" />)

    expect(document.body.textContent).toContain(
      'choose SEC EDGAR Filings on the consent screen'
    )
  })

  test('does not advertise the npx stdio recipe', () => {
    render(<ApiKeysContent repository="sec" />)

    const body = document.body.textContent ?? ''
    expect(body).not.toContain('mcpServers')
    expect(body).not.toContain('npx -y @robosystems/mcp')
  })
})
