import { beforeEach, describe, expect, it } from 'vitest'
import {
  loginPathWith,
  markBridgeAttempt,
  parseDestination,
  shouldSuppressAutoBridge,
} from '../return-to'

describe('parseDestination', () => {
  it('accepts a bare local path from this app’s AuthGuard', () => {
    expect(parseDestination('/graphs/abc?tab=1')).toEqual({
      kind: 'local',
      path: '/graphs/abc?tab=1',
    })
  })

  it.each(['//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com'])(
    'rejects the open-redirect vector %j',
    (raw) => {
      expect(parseDestination(raw)).toBeNull()
    }
  )

  it('parses an app-only return_to', () => {
    expect(parseDestination('roboledger')).toEqual({
      kind: 'app',
      app: 'roboledger',
      path: null,
    })
  })

  it('parses an app-qualified path', () => {
    expect(parseDestination('roboledger:/reports/x')).toEqual({
      kind: 'app',
      app: 'roboledger',
      path: '/reports/x',
    })
  })

  it('degrades an unsafe app path to the default landing', () => {
    expect(parseDestination('roboledger://evil.com')).toEqual({
      kind: 'app',
      app: 'roboledger',
      path: null,
    })
  })

  it('treats a self-app path as local', () => {
    expect(parseDestination('robosystems:/home')).toEqual({
      kind: 'local',
      path: '/home',
    })
  })

  it.each(['robosystems://evil.com', 'robosystems:/\\evil.com'])(
    'degrades an unsafe self-app path to no destination (%j)',
    (raw) => {
      expect(parseDestination(raw)).toBeNull()
    }
  )

  it('treats a self-app default landing as no destination', () => {
    expect(parseDestination('robosystems')).toBeNull()
  })

  it('rejects unknown apps and empty values', () => {
    expect(parseDestination('evilapp:/x')).toBeNull()
    expect(parseDestination('https://evil.com')).toBeNull()
    expect(parseDestination('')).toBeNull()
    expect(parseDestination(null)).toBeNull()
  })
})

describe('bridge attempt marker', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('suppresses a second automatic bridge within the window', () => {
    expect(shouldSuppressAutoBridge('roboledger')).toBe(false)
    markBridgeAttempt('roboledger')
    expect(shouldSuppressAutoBridge('roboledger')).toBe(true)
  })

  it('is scoped per return_to value', () => {
    markBridgeAttempt('roboledger')
    expect(shouldSuppressAutoBridge('roboinvestor')).toBe(false)
  })

  it('expires after the window', () => {
    sessionStorage.setItem(
      'bridge_attempt:roboledger',
      String(Date.now() - 61_000)
    )
    expect(shouldSuppressAutoBridge('roboledger')).toBe(false)
  })

  it('ignores a corrupted marker', () => {
    sessionStorage.setItem('bridge_attempt:roboledger', 'not-a-number')
    expect(shouldSuppressAutoBridge('roboledger')).toBe(false)
  })
})

describe('loginPathWith', () => {
  it('encodes the return_to value', () => {
    expect(loginPathWith('roboledger:/reports/x')).toBe(
      '/login?return_to=roboledger%3A%2Freports%2Fx'
    )
  })

  it('falls back to the bare login path', () => {
    expect(loginPathWith(null)).toBe('/login')
  })
})
