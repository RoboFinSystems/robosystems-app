/**
 * The shapes `@robosystems/client` actually resolves with. The SDK never throws on an
 * HTTP error: it resolves `{ data: undefined, error, response }`. Mocking a failure with
 * `mockRejectedValue` models a path the real SDK never takes, so tests written that way
 * pass against code that ignores `response.error`.
 */
export function sdkError(status: number, detail: unknown = 'Request failed') {
  return {
    data: undefined,
    error: { detail },
    response: { status } as Response,
    request: {} as Request,
  } as never
}

export function sdkOk<T>(data: T, status = 200) {
  return {
    data,
    error: undefined,
    response: { status } as Response,
    request: {} as Request,
  } as never
}
