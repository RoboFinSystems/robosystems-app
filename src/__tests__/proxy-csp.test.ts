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

describe('proxy CSP connect-src (as the deployed server receives the request)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  // A production server reports its own listen address in nextUrl, whatever
  // Host the browser sent, so the hostname cannot mean "running locally".
  it('serves the production policy to a request that reaches it as localhost', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { proxy } = await import('../proxy')
    const response = proxy(
      new NextRequest('http://localhost:3000/tables', {
        headers: { host: 'robosystems.ai' },
      })
    )
    const sources = connectSrc(response.headers.get('Content-Security-Policy'))
    expect(sources).toContain('https://*.s3.amazonaws.com')
    expect(sources).not.toContain('http://localhost:*')
  })
})
