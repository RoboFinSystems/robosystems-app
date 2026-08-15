import { describe, expect, it } from 'vitest'
import { describePasskey, describePlatform } from '../passkey-label'

const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
const WIN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

describe('describePlatform', () => {
  it('prefers the structured platform hint over the user agent', () => {
    expect(describePlatform({ userAgent: MAC_UA, uaPlatform: 'Windows' })).toBe(
      'Windows'
    )
  })

  it('reads the user agent when no structured hint exists', () => {
    expect(describePlatform({ userAgent: IPHONE_UA })).toBe('iPhone')
    expect(describePlatform({ userAgent: WIN_UA })).toBe('Windows')
    expect(describePlatform({ userAgent: MAC_UA })).toBe('Mac')
  })

  it('tells an iPad apart from a Mac by touch points', () => {
    expect(describePlatform({ userAgent: MAC_UA, maxTouchPoints: 5 })).toBe(
      'iPad'
    )
  })

  it('returns null when nothing is recognisable', () => {
    expect(describePlatform({ userAgent: 'curl/8.0' })).toBeNull()
  })
})

describe('describePasskey', () => {
  it('names a platform authenticator after the device', () => {
    expect(
      describePasskey(
        {
          authenticatorAttachment: 'platform',
          response: { transports: ['internal'] },
        },
        { userAgent: MAC_UA }
      )
    ).toBe('Mac')
  })

  it('falls back to "This device" for a platform authenticator on an unknown OS', () => {
    expect(
      describePasskey(
        { authenticatorAttachment: 'platform' },
        { userAgent: 'curl/8.0' }
      )
    ).toBe('This device')
  })

  it('names a phone used via QR code as a phone or tablet', () => {
    expect(
      describePasskey(
        {
          authenticatorAttachment: 'cross-platform',
          response: { transports: ['hybrid'] },
        },
        { userAgent: MAC_UA }
      )
    ).toBe('Phone or tablet')
  })

  it('names a roaming authenticator a security key', () => {
    expect(
      describePasskey(
        {
          authenticatorAttachment: 'cross-platform',
          response: { transports: ['usb', 'nfc'] },
        },
        { userAgent: WIN_UA }
      )
    ).toBe('Security key')
    expect(
      describePasskey({ authenticatorAttachment: 'cross-platform' }, {})
    ).toBe('Security key')
  })

  it('never returns an empty label', () => {
    expect(describePasskey({}, {})).toBe('Passkey')
  })
})
