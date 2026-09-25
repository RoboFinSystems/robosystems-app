import { afterEach, describe, expect, it, vi } from 'vitest'

async function allowedOrigins() {
  const config = await import('../../next.config.js')
  return config.SERVER_ACTION_ALLOWED_ORIGINS as string[]
}

describe('server action allowed origins', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('includes the staging host when the build is for staging', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_ROBOSYSTEMS_APP_URL',
      'https://staging.robosystems.ai'
    )
    expect(await allowedOrigins()).toEqual([
      'robosystems.ai',
      'staging.robosystems.ai',
    ])
  })

  it('keeps the prod apex when the app URL is unset or a placeholder', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_ROBOSYSTEMS_APP_URL',
      '__PLACEHOLDER_ROBOSYSTEMS_APP_URL__'
    )
    expect(await allowedOrigins()).toEqual(['robosystems.ai'])
  })
})
