import { getAuthProviders, registerUser } from '@robosystems/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpForm } from '../SignUpForm'

const mockedRegisterUser = vi.mocked(registerUser)
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
    href: `http://localhost/register${search}`,
    origin: 'http://localhost',
    pathname: '/register',
    search,
    replace: vi.fn(),
    assign: vi.fn(),
  }
}

function fillAndSubmit() {
  fireEvent.change(screen.getByPlaceholderText('Full name'), {
    target: { value: 'Joey' },
  })
  fireEvent.change(screen.getByPlaceholderText('Email address'), {
    target: { value: 'joey@example.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'correct-horse-battery' },
  })
  fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
    target: { value: 'correct-horse-battery' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('SignUpForm (login home fork)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    // Providers posture: unreachable → default posture (core client fails open)
    mockedGetAuthProviders.mockRejectedValue(new Error('no network'))
  })

  afterEach(() => {
    ;(window as { location: unknown }).location = originalLocation
  })

  it('sends the originating app as X-App-Source and routes back through /login', async () => {
    fakeLocation('?return_to=roboledger')
    mockedRegisterUser.mockResolvedValue({
      data: { user: mockUser, message: 'ok' },
    } as never)

    render(<SignUpForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(
        screen.getByText('Create your RoboSystems account')
      ).toBeInTheDocument()
    })
    fillAndSubmit()

    await waitFor(() => {
      expect(mockedRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'X-App-Source': 'roboledger' },
        })
      )
    })
    await waitFor(() => {
      expect(String(window.location.href)).toBe('/login?return_to=roboledger')
    })
  })

  it('registers without the header and lands on the default redirect', async () => {
    fakeLocation('')
    mockedRegisterUser.mockResolvedValue({
      data: { user: mockUser, message: 'ok' },
    } as never)

    render(<SignUpForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(
        screen.getByText('Create your RoboSystems account')
      ).toBeInTheDocument()
    })
    fillAndSubmit()

    await waitFor(() => {
      expect(mockedRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining({ headers: undefined })
      )
    })
    await waitFor(() => {
      expect(String(window.location.href)).toBe('/login')
    })
  })

  it('carries return_to and invite through the sign-in toggle', async () => {
    fakeLocation('?return_to=roboledger&invite=tok123')

    render(<SignUpForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      const link = screen.getByText('Already have an account? Sign in')
      expect(link.getAttribute('href')).toBe(
        '/login?return_to=roboledger&invite=tok123'
      )
    })
  })

  it('renders the invitation-only notice when registration is closed', async () => {
    fakeLocation('')
    mockedGetAuthProviders.mockResolvedValue({
      data: {
        password_auth: true,
        oidc: { enabled: false },
        registration: false,
        passkeys: false,
      },
    } as never)

    render(<SignUpForm apiUrl="http://localhost:8000" />)

    await waitFor(() => {
      expect(
        screen.getByText('Registration is by invitation')
      ).toBeInTheDocument()
    })
    expect(screen.queryByPlaceholderText('Full name')).not.toBeInTheDocument()
  })
})
