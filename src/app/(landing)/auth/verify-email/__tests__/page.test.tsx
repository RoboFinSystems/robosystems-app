import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyEmailPage from '../page'

const mockPush = vi.fn()
// A stable router, like next/navigation's real useRouter — the redirect effect
// depends on it, so it must not change identity between renders.
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}))

// verifyEmail delegates to a stable spy, but the object useAuth returns — and
// the `verifyEmail` reference the component destructures — is recreated on
// every render. That mirrors the auth context updating right after
// verification, which is the real-world trigger for the stranded-redirect bug
// (F3): it re-runs the verification effect, and when the redirect timeout lived
// there, the cleanup cleared it without rescheduling.
const verifyEmailSpy = vi.fn()
vi.mock('@robosystems/core/auth-components/AuthProvider', () => ({
  useAuth: () => ({ verifyEmail: (token: string) => verifyEmailSpy(token) }),
}))

vi.mock('@/components/auth/return-to', () => ({
  loginPathWith: (rt?: string | null) => `/login?return_to=${rt ?? ''}`,
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    verifyEmailSpy.mockReset()
    mockSearchParams = new URLSearchParams('token=tok_abc')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('redirects to /home 3s after success, even as the auth context re-renders (F3)', async () => {
    verifyEmailSpy.mockResolvedValue({ success: true, message: 'Verified' })

    render(<VerifyEmailPage />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('Email Verified!')).toBeInTheDocument()
    // Not yet — the redirect waits 3s so the success message is visible.
    expect(mockPush).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(mockPush).toHaveBeenCalledWith('/home')
  })

  it('honors return_to in the post-verify redirect', async () => {
    mockSearchParams = new URLSearchParams('token=tok_abc&return_to=roboledger')
    verifyEmailSpy.mockResolvedValue({ success: true })

    render(<VerifyEmailPage />)
    // Flush the async verify first (schedules the redirect), then fire the timer.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(mockPush).toHaveBeenCalledWith('/login?return_to=roboledger')
  })

  it('shows an error and never redirects when verification fails', async () => {
    verifyEmailSpy.mockResolvedValue({
      success: false,
      message: 'Invalid token',
    })

    render(<VerifyEmailPage />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error and never redirects when no token is present', async () => {
    mockSearchParams = new URLSearchParams('')

    render(<VerifyEmailPage />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.getByText('Verification Failed')).toBeInTheDocument()
    expect(verifyEmailSpy).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
