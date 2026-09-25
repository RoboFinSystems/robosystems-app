import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

function connectSrc(csp: string | null): string[] {
  const directive = (csp ?? '')
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('connect-src'))
  return directive ? directive.split(/\s+/).slice(1) : []
}

async function productionConnectSrc() {
  const { proxy } = await import('../proxy')
  const response = proxy(new NextRequest('https://robosystems.ai/tables'))
  return connectSrc(response.headers.get('Content-Security-Policy'))
}

describe('proxy CSP connect-src (production host)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('allows the Data Lake upload PUT to the presigned S3 URL, in both host forms', async () => {
    const sources = await productionConnectSrc()
    expect(sources).toContain('https://*.s3.amazonaws.com')
    expect(sources).toContain('https://*.s3.us-east-1.amazonaws.com')
  })

  it('allows the configured API origin, not only the hosted ones', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOSYSTEMS_API_URL', 'https://api.corp.example/')
    const sources = await productionConnectSrc()
    expect(sources).toContain('https://api.corp.example')
    expect(sources).toContain('https://api.robosystems.ai')
  })

  it('ignores an API URL that is not a URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_ROBOSYSTEMS_API_URL', '__PLACEHOLDER__')
    const sources = await productionConnectSrc()
    expect(sources.some((s) => s.includes('PLACEHOLDER'))).toBe(false)
  })
})
