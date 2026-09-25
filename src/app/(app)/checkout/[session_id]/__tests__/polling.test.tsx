import { sdkError, sdkOk } from '@/test-utils/sdk'
import * as SDK from '@robosystems/client'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const handleApiError = vi.fn()
const showError = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useApiError: () => ({ handleApiError }),
    useGraphContext: () => ({ refreshGraphs: vi.fn() }),
    useToast: () => ({
      showError,
      showSuccess: vi.fn(),
      ToastContainer: () => null,
    }),
  }
})

import { CheckoutContent } from '../content'

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('checkout status polling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })
  afterEach(() => vi.useRealTimers())

  it('treats an unpaid subscription as a failed payment and stops polling', async () => {
    vi.mocked(SDK.getCheckoutStatus).mockResolvedValue(
      sdkOk({ status: 'unpaid', subscription_id: 'sub_1' })
    )
    render(<CheckoutContent sessionId="cs_1" />)
    await advance(10_000)
    expect(screen.getByText('Payment processing failed.')).toBeInTheDocument()
    expect(SDK.getCheckoutStatus).toHaveBeenCalledTimes(1)
  })

  it('gives up on a session that keeps failing instead of toasting every 3 seconds', async () => {
    vi.mocked(SDK.getCheckoutStatus).mockResolvedValue(
      sdkError(404, 'Checkout session not found')
    )
    render(<CheckoutContent sessionId="cs_gone" />)
    await advance(120_000)
    expect(
      vi.mocked(SDK.getCheckoutStatus).mock.calls.length
    ).toBeLessThanOrEqual(5)
    expect(handleApiError).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText(/could not check this payment/i)
    ).toBeInTheDocument()
  })

  it('stops polling after an overall time limit', async () => {
    vi.mocked(SDK.getCheckoutStatus).mockResolvedValue(
      sdkOk({ status: 'provisioning' })
    )
    render(<CheckoutContent sessionId="cs_slow" />)
    await advance(15 * 60_000)
    const calls = vi.mocked(SDK.getCheckoutStatus).mock.calls.length
    await advance(60_000)
    expect(vi.mocked(SDK.getCheckoutStatus).mock.calls.length).toBe(calls)
    expect(screen.getByText(/taking longer than expected/i)).toBeInTheDocument()
  })
})
