/**
 * The failure carried by a resolved `@robosystems/client` result, or null when the call
 * succeeded. The SDK resolves HTTP errors as `{ data: undefined, error, response }` and
 * never throws them, so a status-keyed `catch` never sees one.
 */
export interface SdkFailure {
  status: number
  detail: string
}

export function sdkFailure(
  result: { error?: unknown; response?: { status?: number } | Response },
  fallback: string
): SdkFailure | null {
  if (result.error === undefined || result.error === null) return null
  const status = result.response?.status ?? 0
  return { status, detail: errorDetail(result.error) ?? fallback }
}

function errorDetail(error: unknown): string | undefined {
  if (typeof error === 'string') return error || undefined
  if (error instanceof Error) return error.message || undefined
  if (error && typeof error === 'object' && 'detail' in error) {
    const detail = (error as { detail: unknown }).detail
    if (typeof detail === 'string') return detail || undefined
    if (detail && typeof detail === 'object' && 'detail' in detail) {
      const nested = (detail as { detail: unknown }).detail
      if (typeof nested === 'string') return nested || undefined
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) =>
          item && typeof item === 'object' && 'msg' in item
            ? String((item as { msg: unknown }).msg)
            : undefined
        )
        .filter(Boolean)
      if (messages.length > 0) return messages.join('; ')
    }
  }
  return undefined
}
