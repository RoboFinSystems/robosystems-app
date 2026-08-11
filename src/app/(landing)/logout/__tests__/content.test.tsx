import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LogoutContent from '../content'

const mockLogout = vi.fn().mockResolvedValue(undefined)
vi.mock('@robosystems/core/auth-components/AuthProvider', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

describe('LogoutContent (login home logout chain)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('clears the anchor session and returns to the originating app', () => {
    window.history.replaceState({}, '', '/logout?return_to=roboledger')

    render(<LogoutContent />)

    expect(mockLogout).toHaveBeenCalledWith(undefined, {
      redirectTo: 'https://roboledger.ai',
    })
  })

  it('signs out locally without a return_to', () => {
    window.history.replaceState({}, '', '/logout')

    render(<LogoutContent />)

    expect(mockLogout).toHaveBeenCalledWith()
  })

  it('ignores an unknown app instead of redirecting', () => {
    window.history.replaceState({}, '', '/logout?return_to=evilapp')

    render(<LogoutContent />)

    expect(mockLogout).toHaveBeenCalledWith()
  })

  it('treats a self return_to as a local sign-out', () => {
    window.history.replaceState({}, '', '/logout?return_to=robosystems')

    render(<LogoutContent />)

    expect(mockLogout).toHaveBeenCalledWith()
  })
})
