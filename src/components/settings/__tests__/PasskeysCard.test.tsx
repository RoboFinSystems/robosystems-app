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

  it('Add passkey opens the password modal before any ceremony', async () => {
    render(<PasskeysCard />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Add passkey' })
      ).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add passkey' }))

    expect(screen.getByText('Add a passkey')).toBeInTheDocument()
    // No options request until the password is confirmed.
    expect(mockedGetPasskeyRegistrationOptions).not.toHaveBeenCalled()
    expect(mockedStartRegistration).not.toHaveBeenCalled()
  })

  it('confirming the password sends it as the re-auth proof and enrolls', async () => {
    mockedGetPasskeyRegistrationOptions.mockResolvedValueOnce({
      data: { options: { challenge: 'c1' } },
    } as never)
    mockedStartRegistration.mockResolvedValueOnce({ id: 'cred-1' } as never)
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
        screen.getByRole('button', { name: 'Add passkey' })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add passkey' }))
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
    // One-time recovery codes surface after first enrollment.
    expect(screen.getByText('AAAAA-AAAAA')).toBeInTheDocument()
  })
})
