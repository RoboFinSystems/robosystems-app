import { sdkOk } from '@/test-utils/sdk'
import * as SDK from '@robosystems/client'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const handleApiError = vi.fn()

vi.mock('@robosystems/core', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@robosystems/core')
  return {
    ...actual,
    useOrg: () => ({ currentOrg: { id: 'org_1', role: 'owner' } }),
    useServiceOfferings: () => ({ offerings: {}, isLoading: false }),
    useApiError: () => ({ handleApiError }),
  }
})

import { useBillingData } from '../billing-panels'

describe('useBillingData', () => {
  beforeEach(() => {
    vi.mocked(SDK.getOrgBillingCustomer).mockResolvedValue(sdkOk(null) as never)
    vi.mocked(SDK.getOrgUpcomingInvoice).mockResolvedValue(sdkOk(null) as never)
    vi.mocked(SDK.listOrgInvoices).mockResolvedValue(
      sdkOk({ invoices: [] }) as never
    )
    vi.mocked(SDK.listOrgSubscriptions).mockResolvedValue(sdkOk([]) as never)
  })

  // The org page swaps the panels for a spinner while `loading`; unmounting
  // SubscriptionsTab on the refresh after a tier change stopped its monitor.
  it('keeps the panels mounted while a reload is in flight', async () => {
    const { result } = renderHook(() => useBillingData(true))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let finish: (value: unknown) => void = () => {}
    vi.mocked(SDK.listOrgSubscriptions).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }) as never
    )
    let reload: Promise<void> | undefined
    act(() => {
      reload = result.current.reload()
    })

    expect(result.current.loading).toBe(false)

    await act(async () => {
      finish(sdkOk([]))
      await reload
    })
  })

  it('gates the panels on the first load', () => {
    const { result } = renderHook(() => useBillingData(true))
    expect(result.current.loading).toBe(true)
  })
})
