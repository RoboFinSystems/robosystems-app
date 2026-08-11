/**
 * Deployment auth posture from `GET /v1/auth/providers`.
 *
 * A rendering hint, not a security boundary — the backend enforces every
 * flag regardless of what the page shows. One byte-identical frontend
 * build renders password-primary (managed), OIDC-primary (tenant), or
 * closed-registration postures from this payload.
 */
export interface AuthProviders {
  password_auth: boolean
  oidc: {
    enabled: boolean
    provider_label?: string | null
  }
  registration: boolean
  passkeys: boolean
}

/** Any failure returns null and the form renders the default posture. */
export async function fetchAuthProviders(
  apiUrl: string
): Promise<AuthProviders | null> {
  try {
    const response = await fetch(`${apiUrl}/v1/auth/providers`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (typeof data?.password_auth !== 'boolean') {
      return null
    }
    return data as AuthProviders
  } catch {
    return null
  }
}
