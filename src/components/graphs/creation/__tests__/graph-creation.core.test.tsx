import { sdkError, sdkOk } from '@/test-utils/sdk'
import * as SDK from '@robosystems/client'
import { useGraphCreation } from '@robosystems/core'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Runs the real core useGraphCreation (0.11.3) against the SDK mock: what the wizard
// hands it must reach the request, and a refusal must come back as its message.
describe('core useGraphCreation, as the wizard calls it', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the generic custom_schema and tags top-level', async () => {
    vi.mocked(SDK.createGraph).mockResolvedValue(
      sdkError(422, 'Graph limit reached')
    )
    const { result } = renderHook(() => useGraphCreation())
    const schema = {
      name: 'crm',
      nodes: [{ name: 'Customer' }],
      relationships: [],
    }

    let error: unknown
    await act(async () => {
      await result.current
        .createGenericGraph({
          graph_name: 'My Graph',
          tags: ['prod'],
          custom_schema: schema,
        })
        .catch((e: unknown) => {
          error = e
        })
    })

    const body = vi.mocked(SDK.createGraph).mock.calls[0][0]!.body as Record<
      string,
      unknown
    >
    expect(body.custom_schema).toEqual(schema)
    expect(body.tags).toEqual(['prod'])
    expect((error as Error).message).toBe('Graph limit reached')
  })

  it('sends an empty schema for the empty choice', async () => {
    vi.mocked(SDK.createGraph).mockResolvedValue(sdkError(500, 'x'))
    const { result } = renderHook(() => useGraphCreation())
    await act(async () => {
      await result.current
        .createGenericGraph({ graph_name: 'My Graph' })
        .catch(() => {})
    })
    const body = vi.mocked(SDK.createGraph).mock.calls[0][0]!.body as Record<
      string,
      unknown
    >
    expect(body.custom_schema).toMatchObject({ nodes: [], relationships: [] })
  })

  it('rejects with the detail of a checkout 422', async () => {
    vi.mocked(SDK.getOrgBillingCustomer).mockResolvedValue(
      sdkOk({ has_payment_method: false, invoice_billing_enabled: false })
    )
    vi.mocked(SDK.createCheckoutSession).mockResolvedValue(
      sdkError(422, [{ loc: ['body', 'plan_name'], msg: 'Unknown plan' }])
    )
    const { result } = renderHook(() => useGraphCreation())
    let error: unknown
    await act(async () => {
      await result.current
        .createGenericGraph({ graph_name: 'My Graph', org_id: 'org_1' })
        .catch((e: unknown) => {
          error = e
        })
    })
    expect((error as Error).message).toContain('Unknown plan')
    expect(SDK.createGraph).not.toHaveBeenCalled()
  })
})
