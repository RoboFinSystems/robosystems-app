/**
 * The MCP OAuth consent leg, as the login home sees it.
 *
 * The API parks an authorization request and sends the browser here with a
 * `request_id`; this page reads the request with the app session, shows the
 * user who is asking and where approval sends them, lets them pick the one
 * graph the grant covers (on the graph-agnostic MCP route), and posts the
 * decision back. The API answers with the client's callback URL, which the
 * browser must navigate to — the API never redirects the browser itself
 * from a JSON call.
 *
 * These endpoints are schema-excluded on the API (they are an OAuth protocol
 * surface, not SDK surface), so this is a plain fetch with the session
 * bearer rather than a generated client call.
 */

import { getValidToken } from '@robosystems/core'
import { MCP_API_URL } from './mcp'

export interface PendingAuthorization {
  request_id: string
  client_name: string
  client_uri: string | null
  logo_uri: string | null
  is_trusted: boolean
  redirect_host: string
  is_loopback_redirect: boolean
  resource: string
  /** Fixed by the resource URL on a per-graph route; null when the user picks. */
  graph_id: string | null
  scope: string
}

export interface ConsentDecision {
  approved: boolean
  graph_id: string | null
}

export type ConsentErrorKind =
  'expired' | 'forbidden' | 'unauthenticated' | 'unknown'

export class ConsentError extends Error {
  kind: ConsentErrorKind

  constructor(kind: ConsentErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

/** The request id is a bearer capability for the pending request; refuse
 * anything that is not the shape the API mints before it reaches a URL. */
export const isValidRequestId = (
  value: string | null | undefined
): value is string =>
  typeof value === 'string' && REQUEST_ID_PATTERN.test(value)

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getValidToken()
  if (!token) {
    throw new ConsentError('unauthenticated', 'Sign in to continue')
  }
  return { Authorization: `Bearer ${token}` }
}

function classify(status: number): ConsentErrorKind {
  if (status === 404) return 'expired'
  if (status === 403) return 'forbidden'
  if (status === 401) return 'unauthenticated'
  return 'unknown'
}

async function detailOf(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body.detail === 'string' && body.detail) return body.detail
  } catch {
    // no JSON body
  }
  return fallback
}

export async function fetchPendingAuthorization(
  requestId: string
): Promise<PendingAuthorization> {
  const response = await fetch(
    `${MCP_API_URL}/v1/oauth/authorize/${encodeURIComponent(requestId)}`,
    { headers: await authHeaders(), cache: 'no-store' }
  )
  if (!response.ok) {
    throw new ConsentError(
      classify(response.status),
      await detailOf(response, 'Unable to load the authorization request')
    )
  }
  return (await response.json()) as PendingAuthorization
}

/** Returns the client's callback URL the browser must navigate to. */
export async function submitConsentDecision(
  requestId: string,
  decision: ConsentDecision
): Promise<string> {
  const response = await fetch(
    `${MCP_API_URL}/v1/oauth/authorize/${encodeURIComponent(requestId)}/decision`,
    {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(decision),
    }
  )
  if (!response.ok) {
    throw new ConsentError(
      classify(response.status),
      await detailOf(response, 'Unable to record your decision')
    )
  }
  const body = (await response.json()) as { redirect_to?: unknown }
  if (typeof body.redirect_to !== 'string' || !body.redirect_to) {
    throw new ConsentError(
      'unknown',
      'The authorization server returned no redirect'
    )
  }
  return body.redirect_to
}
