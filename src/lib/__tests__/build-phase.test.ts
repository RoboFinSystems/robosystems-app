import { afterEach, describe, expect, it, vi } from 'vitest'
import { orBuildFallback } from '../build-phase'

describe('orBuildFallback', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('falls back during the production build', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(
      orBuildFallback(Promise.reject(new Error('cdn down')), [])
    ).resolves.toEqual([])
  })

  it('rethrows at runtime so regeneration keeps the last good render', async () => {
    await expect(
      orBuildFallback(Promise.reject(new Error('cdn down')), [])
    ).rejects.toThrow('cdn down')
  })
})
