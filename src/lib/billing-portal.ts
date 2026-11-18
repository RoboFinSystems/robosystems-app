import * as SDK from '@robosystems/client'

/**
 * Send the browser to the Stripe billing portal, where an owner adds or
 * changes the organization's card. Throws with the API's reason on failure.
 */
export async function openBillingPortal(orgId: string): Promise<void> {
  const response = await SDK.createPortalSession({ path: { org_id: orgId } })
  if (response.error) {
    const error: unknown = response.error
    throw new Error(
      typeof error === 'object' && error !== null && 'detail' in error
        ? String((error as { detail: unknown }).detail)
        : 'Failed to open the billing portal'
    )
  }
  if (response.data?.portal_url) {
    window.location.href = response.data.portal_url
  }
}
