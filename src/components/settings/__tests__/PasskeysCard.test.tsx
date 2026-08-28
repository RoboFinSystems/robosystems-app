import {
  getMfaStatus,
  getPasskeyRegistrationOptions,
  listUserPasskeys,
  verifyPasskeyRegistration,
} from '@robosystems/client'
import { startRegistration } from '@simplewebauthn/browser'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PasskeysCard } from '../PasskeysCard'

const mockedListUserPasskeys = vi.mocked(listUserPasskeys)
const mockedGetMfaStatus = vi.mocked(getMfaStatus)
const mockedGetPasskeyRegistrationOptions = vi.mocked(
  getPasskeyRegistrationOptions
)
const mockedVerifyPasskeyRegistration = vi.mocked(verifyPasskeyRegistration)
const mockedStartRegistration = vi.mocked(startRegistration)

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn(),
  startRegistration: vi.fn(),
}))

describe('PasskeysCard enrollment re-auth gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedListUserPasskeys.mockResolvedValue({
      data: { passkeys: [] },
    } as never)
    mockedGetMfaStatus.mockResolvedValue({
      data: {
        passkey_count: 0,
        recovery_codes_remaining: 0,
        enforcement_applies: false,
      },
    } as never)
  })

  it('shows an empty state with a single create action and no name input', async () => {
    render(<PasskeysCard />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Create a passkey' })
      ).toBeInTheDocument()
    )

    expect(screen.getByText('No passkeys yet')).toBeInTheDocument()
    // WebAuthn never asks for a name, so neither do we.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText(/passkey name/i)
    ).not.toBeInTheDocument()
  })

  it('Create a passkey opens the password modal before any ceremony', async () => {
    render(<PasskeysCard />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Create a passkey' })
      ).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Create a passkey' }))

    expect(screen.getByText('Add a passkey')).toBeInTheDocument()
    // No options request until the password is confirmed.
    expect(mockedGetPasskeyRegistrationOptions).not.toHaveBeenCalled()
    expect(mockedStartRegistration).not.toHaveBeenCalled()
  })

  it('confirming the password sends it as the re-auth proof and enrolls', async () => {
    mockedGetPasskeyRegistrationOptions.mockResolvedValueOnce({
      data: { options: { challenge: 'c1' } },
    } as never)
    mockedStartRegistration.mockResolvedValueOnce({
      id: 'cred-1',
      authenticatorAttachment: 'platform',
      response: { transports: ['internal'] },
    } as never)
    mockedVerifyPasskeyRegistration.mockResolvedValueOnce({
      data: {
        passkey: { id: 'upk_1', name: 'My Key' },
        recovery_codes: ['AAAAA-AAAAA'],
        auth: null,
      },
    } as never)
    const onSuccess = vi.fn()

    render(<PasskeysCard onSuccess={onSuccess} />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Create a passkey' })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create a passkey' }))
    fireEvent.change(screen.getByPlaceholderText('Current password'), {
      target: { value: 'hunter2!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('Passkey added'))
    expect(mockedGetPasskeyRegistrationOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ password: 'hunter2!' }),
      })
    )
    // The label is derived from the ceremony, never typed by the user.
    expect(mockedVerifyPasskeyRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ name: expect.any(String) }),
      })
    )
    // One-time recovery codes surface after first enrollment.
    expect(screen.getByText('AAAAA-AAAAA')).toBeInTheDocument()
  })

  it('lists enrolled passkeys with an add-another action instead of the empty state', async () => {
    mockedListUserPasskeys.mockResolvedValue({
      data: {
        passkeys: [
          {
            id: 'upk_1',
            name: 'Mac',
            created_at: '2026-08-15T00:00:00Z',
            last_used_at: null,
            backup_eligible: true,
          },
        ],
      },
    } as never)
    mockedGetMfaStatus.mockResolvedValue({
      data: {
        passkey_count: 1,
        recovery_codes_remaining: 8,
        enforcement_applies: false,
      },
    } as never)

    render(<PasskeysCard />)
    await waitFor(() => expect(screen.getByText('Mac')).toBeInTheDocument())

    expect(screen.queryByText('No passkeys yet')).not.toBeInTheDocument()
    expect(screen.getByText('Synced')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add another passkey' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
