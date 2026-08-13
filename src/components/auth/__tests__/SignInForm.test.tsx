import {
  generateSsoToken,
  getAuthProviders,
  getCurrentAuthUser,
  getMfaOptions,
  getPasskeyLoginOptions,
  loginUser,
  ssoTokenExchange,
  verifyMfa,
  verifyPasskeyLogin,
  verifyPasskeyRegistration,
} from '@robosystems/client'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SignInForm } from '../SignInForm'

const mockedGetCurrentAuthUser = vi.mocked(getCurrentAuthUser)
const mockedLoginUser = vi.mocked(loginUser)
const mockedGenerateSsoToken = vi.mocked(generateSsoToken)
const mockedSsoTokenExchange = vi.mocked(ssoTokenExchange)
const mockedGetAuthProviders = vi.mocked(getAuthProviders)
const mockedGetMfaOptions = vi.mocked(getMfaOptions)
const mockedVerifyMfa = vi.mocked(verifyMfa)
const mockedGetPasskeyLoginOptions = vi.mocked(getPasskeyLoginOptions)
const mockedVerifyPasskeyLogin = vi.mocked(verifyPasskeyLogin)
const mockedVerifyPasskeyRegistration = vi.mocked(verifyPasskeyRegistration)
const mockedStartAuthentication = vi.mocked(startAuthentication)
const mockedStartRegistration = vi.mocked(startRegistration)

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn(),
  startRegistration: vi.fn(),
}))

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

describe('SignInForm passkey MFA lanes', () => {
  const sessionData = {
    user: mockUser,
    message: 'Login successful',
    status: 'authenticated',
    token: 'jwt-1',
    expires_in: 1800,
    refresh_threshold: 300,
  }

  function submitPasswordLogin() {
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'joey@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pw-123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()
    fakeLocation('')
    mockedGetCurrentAuthUser.mockRejectedValue(new Error('unauthorized'))
    mockedGetAuthProviders.mockRejectedValue(new Error('no network'))
  })

  afterEach(() => {
    localStorage.clear()
    ;(window as { location: unknown }).location = originalLocation
  })

  it('mfa_required interposes the challenge step and completes via passkey', async () => {
    mockedLoginUser.mockResolvedValueOnce({
      data: {
        user: mockUser,
        status: 'mfa_required',
        mfa_token: 'mfa-tok-1',
        message: 'Additional verification required',
      },
    } as never)
    mockedGetMfaOptions.mockResolvedValueOnce({
      data: { options: { challenge: 'c1' } },
    } as never)
    mockedStartAuthentication.mockResolvedValueOnce({ id: 'cred-1' } as never)
    mockedVerifyMfa.mockResolvedValueOnce({ data: sessionData } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    )
    submitPasswordLogin()

    // The auto-started ceremony resolves straight through to routing.
    await waitFor(() => {
      expect(String(window.location.href)).toBe('/home')
    })
    expect(mockedVerifyMfa).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          mfa_token: 'mfa-tok-1',
          assertion: { id: 'cred-1' },
        }),
      })
    )
  })

  it('falls back to the recovery-code lane when the assertion fails', async () => {
    mockedLoginUser.mockResolvedValueOnce({
      data: { user: mockUser, status: 'mfa_required', mfa_token: 'mfa-tok-2' },
    } as never)
    mockedGetMfaOptions.mockResolvedValue({
      data: { options: { challenge: 'c2' } },
    } as never)
    mockedStartAuthentication.mockRejectedValue(new Error('no authenticator'))
    mockedVerifyMfa.mockResolvedValueOnce({ data: sessionData } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    )
    submitPasswordLogin()

    await waitFor(() => {
      expect(screen.getByText(/Verify it/)).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(
        screen.getByText('Use a recovery code instead')
      ).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Use a recovery code instead'))
    fireEvent.change(screen.getByPlaceholderText(/Recovery code/), {
      target: { value: 'AAAAA-BBBBB' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Verify recovery code' })
    )

    await waitFor(() => {
      expect(String(window.location.href)).toBe('/home')
    })
    expect(mockedVerifyMfa).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          mfa_token: 'mfa-tok-2',
          recovery_code: 'AAAAA-BBBBB',
        }),
      })
    )
  })

  it('mfa_enrollment_required routes through forced enrollment with recovery codes', async () => {
    mockedLoginUser.mockResolvedValueOnce({
      data: {
        user: mockUser,
        status: 'mfa_enrollment_required',
        mfa_token: 'enroll-tok-1',
      },
    } as never)
    mockedStartRegistration.mockResolvedValueOnce({ id: 'new-cred' } as never)
    // Core fetches options first, then verifies; both ride the SDK mocks.
    const { getPasskeyRegistrationOptions } =
      await import('@robosystems/client')
    vi.mocked(getPasskeyRegistrationOptions).mockResolvedValueOnce({
      data: { options: { challenge: 'c3' } },
    } as never)
    mockedVerifyPasskeyRegistration.mockResolvedValueOnce({
      data: {
        passkey: { id: 'upk_1', name: 'Key' },
        recovery_codes: ['AAAAA-AAAAA', 'BBBBB-BBBBB'],
        auth: sessionData,
      },
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    )
    submitPasswordLogin()

    await waitFor(() => {
      expect(screen.getByText('Set up your passkey')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create passkey' }))

    // One-time recovery codes gate the continue button.
    await waitFor(() => {
      expect(screen.getByText('AAAAA-AAAAA')).toBeInTheDocument()
    })
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(String(window.location.href)).toBe('/home')
    })
  })

  it('gates the passwordless button on posture and signs in with a passkey', async () => {
    mockedGetAuthProviders.mockResolvedValue({
      data: {
        password_auth: true,
        oidc: { enabled: false },
        registration: true,
        passkeys: true,
      },
    } as never)
    mockedGetPasskeyLoginOptions.mockResolvedValueOnce({
      data: { options: { challenge: 'pwl' } },
    } as never)
    mockedStartAuthentication.mockResolvedValueOnce({ id: 'cred-9' } as never)
    mockedVerifyPasskeyLogin.mockResolvedValueOnce({
      data: sessionData,
    } as never)

    render(<SignInForm apiUrl="http://localhost:8000" />)
    const passkeyButton = await screen.findByRole('button', {
      name: 'Sign in with a passkey',
    })
    fireEvent.click(passkeyButton)

    await waitFor(() => {
      expect(String(window.location.href)).toBe('/home')
    })
  })

  it('hides the passwordless button under the default posture', async () => {
    render(<SignInForm apiUrl="http://localhost:8000" />)
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    )
    expect(
      screen.queryByRole('button', { name: 'Sign in with a passkey' })
    ).toBeNull()
  })
})
