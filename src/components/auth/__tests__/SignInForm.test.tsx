import {
  generateSsoToken,
  getAuthProviders,
  getCurrentAuthUser,
  loginUser,
  ssoTokenExchange,
} from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SignInForm } from '../SignInForm'

const mockedGetCurrentAuthUser = vi.mocked(getCurrentAuthUser)
const mockedLoginUser = vi.mocked(loginUser)
const mockedGenerateSsoToken = vi.mocked(generateSsoToken)
const mockedSsoTokenExchange = vi.mocked(ssoTokenExchange)
const mockedGetAuthProviders = vi.mocked(getAuthProviders)

const mockUser = {
  id: 'user-1',
  email: 'joey@example.com',
  name: 'Joey',
}

const originalLocation = window.location

function fakeLocation(search: string) {
  delete (window as { location?: Location }).location
  ;(window as { location: unknown }).location = {
    href: `http://localhost/login${search}`,
    origin: 'http://localhost',
    pathname: '/login',
    search,
    replace: vi.fn(),
    assign: vi.fn(),
  }
}

function mockBridgeEndpoints() {
  mockedGenerateSsoToken.mockResolvedValue({
    data: { token: 'sso-tok' },
  } as never)
  mockedSsoTokenExchange.mockResolvedValue({
    data: { session_id: 'sess-1' },
  } as never)
}

describe('SignInForm (login home fork)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    // Providers posture: unreachable → default posture (core client fails open)
    mockedGetAuthProviders.mockRejectedValue(new Error('no network'))
  })

  afterEach(() => {
    ;(window as { location: unknown }).location = originalLocation
  })

  it('renders the platform-identity form when unauthenticated', async () => {
    fakeLocation('')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })
    expect(
      screen.getByText('One account for RoboSystems, RoboLedger & RoboInvestor')
    ).toBeInTheDocument()
    expect(screen.getByText(/Sign up/)).toBeInTheDocument()
  })

  it('shows the continues-to context line for a product-app return_to', async () => {
    fakeLocation('?return_to=roboledger%3A%2Freports%2Fx')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('RoboLedger')).toBeInTheDocument()
    })
    expect(screen.getByText('Continues to')).toBeInTheDocument()
  })

  it('silently bridges an authenticated visit with a cross-app return_to', async () => {
    fakeLocation('?return_to=roboledger%3A%2Freports%2Fx')
    mockedGetCurrentAuthUser.mockResolvedValue({
      data: { user: mockUser },
    } as never)
    mockBridgeEndpoints()

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(String(window.location.href)).toContain(
        'https://roboledger.ai/login?session_id=sess-1'
      )
    })
    expect(String(window.location.href)).toContain('returnUrl=%2Freports%2Fx')
    expect(
      sessionStorage.getItem('bridge_attempt:roboledger:/reports/x')
    ).not.toBeNull()
  })

  it('lands an authenticated visit with a local return_to on that path', async () => {
    fakeLocation('?return_to=%2Fgraphs%2Fabc')
    mockedGetCurrentAuthUser.mockResolvedValue({
      data: { user: mockUser },
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(String(window.location.href)).toBe('/graphs/abc')
    })
    expect(mockedGenerateSsoToken).not.toHaveBeenCalled()
  })

  it('downgrades to a manual interstitial after a failed bridge', async () => {
    fakeLocation('?return_to=roboledger&reason=bridge_failed')
    mockedGetCurrentAuthUser.mockResolvedValue({
      data: { user: mockUser },
    } as never)
    mockBridgeEndpoints()

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('Continue to RoboLedger')).toBeInTheDocument()
    })
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    expect(mockedGenerateSsoToken).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Continue to RoboLedger'))
    await waitFor(() => {
      expect(String(window.location.href)).toContain(
        'https://roboledger.ai/login?session_id=sess-1'
      )
    })
  })

  it('suppresses the auto-bridge when a fresh attempt marker exists', async () => {
    fakeLocation('?return_to=roboledger')
    sessionStorage.setItem('bridge_attempt:roboledger', String(Date.now()))
    mockedGetCurrentAuthUser.mockResolvedValue({
      data: { user: mockUser },
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('Continue to RoboLedger')).toBeInTheDocument()
    })
    expect(mockedGenerateSsoToken).not.toHaveBeenCalled()
  })

  it('bridges onward after a manual sign-in with a cross-app return_to', async () => {
    fakeLocation('?return_to=roboledger')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))
    mockedLoginUser.mockResolvedValue({
      data: { user: mockUser, message: 'ok' },
    } as never)
    mockBridgeEndpoints()

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'joey@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'hunter22!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(String(window.location.href)).toContain(
        'https://roboledger.ai/login?session_id=sess-1'
      )
    })
  })

  it('hides the sign-up toggle when registration is disabled', async () => {
    fakeLocation('')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))
    mockedGetAuthProviders.mockResolvedValue({
      data: {
        password_auth: true,
        oidc: { enabled: false },
        registration: false,
        passkeys: false,
      },
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.queryByText(/Sign up/)).not.toBeInTheDocument()
    })
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
  })

  it('replaces the form with a posture notice when password auth is disabled', async () => {
    fakeLocation('')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))
    mockedGetAuthProviders.mockResolvedValue({
      data: {
        password_auth: false,
        oidc: { enabled: true, provider_label: 'Okta' },
        registration: false,
        passkeys: false,
      },
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(
        screen.getByText(/managed by your organization via Okta/)
      ).toBeInTheDocument()
    })
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument()
  })
})
