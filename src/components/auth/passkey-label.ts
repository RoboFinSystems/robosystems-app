/**
 * Derive a display label for a freshly enrolled passkey.
 *
 * WebAuthn never asks the user to name a credential — the browser or
 * password manager runs the whole ceremony — so we don't either. The label
 * exists only so two entries can be told apart in the settings list when one
 * is being removed. It is built from what the ceremony already returns
 * (authenticator attachment and transports) plus the browser's platform, so
 * a user who enrolls from a MacBook and later from an iPhone sees "Mac" and
 * "iPhone" rather than "Passkey" twice. The backend stores the AAGUID too, so
 * a provider-derived default ("iCloud Keychain") can replace this later
 * without a frontend change.
 */

export interface PasskeyCredentialHints {
  authenticatorAttachment?: string | null
  response?: { transports?: string[] | null }
}

export interface PlatformHints {
  userAgent?: string
  /** `navigator.userAgentData?.platform` where available. */
  uaPlatform?: string
  maxTouchPoints?: number
}

const PLATFORM_LABELS: Array<[RegExp, string]> = [
  [/iphone/i, 'iPhone'],
  [/ipad/i, 'iPad'],
  [/android/i, 'Android'],
  [/cros|chrome os|chromeos/i, 'Chromebook'],
  [/windows/i, 'Windows'],
  [/mac/i, 'Mac'],
  [/linux/i, 'Linux'],
]

export function describePlatform(hints: PlatformHints): string | null {
  const source = hints.uaPlatform || hints.userAgent || ''
  for (const [pattern, label] of PLATFORM_LABELS) {
    if (pattern.test(source)) {
      // iPadOS Safari reports itself as a Mac; touch points tell them apart.
      if (label === 'Mac' && (hints.maxTouchPoints ?? 0) > 1) return 'iPad'
      return label
    }
  }
  return null
}

export function describePasskey(
  credential: PasskeyCredentialHints,
  hints: PlatformHints
): string {
  const transports = credential.response?.transports ?? []
  const onThisDevice =
    credential.authenticatorAttachment === 'platform' ||
    transports.includes('internal')

  if (onThisDevice) {
    return describePlatform(hints) ?? 'This device'
  }
  // A phone used via QR code from another device.
  if (transports.includes('hybrid')) {
    return 'Phone or tablet'
  }
  if (
    credential.authenticatorAttachment === 'cross-platform' ||
    transports.some((t) => t === 'usb' || t === 'nfc' || t === 'ble')
  ) {
    return 'Security key'
  }
  return describePlatform(hints) ?? 'Passkey'
}

/** Read the platform hints the browser exposes; safe to call during SSR. */
export function browserPlatformHints(): PlatformHints {
  if (typeof navigator === 'undefined') return {}
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string }
  }
  return {
    userAgent: nav.userAgent,
    uaPlatform: nav.userAgentData?.platform,
    maxTouchPoints: nav.maxTouchPoints,
  }
}
