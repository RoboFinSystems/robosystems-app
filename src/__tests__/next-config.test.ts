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

  it('lists prod and staging with no app URL in the environment (the App Runner runtime)', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOSYSTEMS_APP_URL', '')
    expect(await allowedOrigins()).toEqual([
      'robosystems.ai',
      'staging.robosystems.ai',
    ])
  })

  it('adds the host of a configured app URL (a self-hosted image)', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOSYSTEMS_APP_URL', 'https://ledger.corp.example')
    expect(await allowedOrigins()).toContain('ledger.corp.example')
  })

  it('ignores a placeholder app URL', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_ROBOSYSTEMS_APP_URL',
      '__PLACEHOLDER_ROBOSYSTEMS_APP_URL__'
    )
    expect(await allowedOrigins()).toEqual([
      'robosystems.ai',
      'staging.robosystems.ai',
    ])
  })
})

describe('the booking path', () => {
  it('sends /book to the public scheduler, temporarily, from the URL site.ts names', async () => {
    const config = await import('../../next.config.js')
    const { BOOK_PATH, SCHEDULING_URL } = await import('../lib/site')
    const redirects = await config.default.redirects()

    expect(config.SCHEDULING_URL).toBe(SCHEDULING_URL)
    expect(redirects).toContainEqual({
      source: BOOK_PATH,
      destination: SCHEDULING_URL,
      permanent: false,
    })
  })

  it('points at the public booking page', async () => {
    const { SCHEDULING_URL } = await import('../lib/site')

    expect(SCHEDULING_URL).toMatch(
      /^https:\/\/scheduler\.zoom\.us\/[\w-]+\/intro-meeting$/
    )
  })
})
