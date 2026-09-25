import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/sns', () => ({
  snsService: { publishContactForm: vi.fn() },
}))

import { snsService } from '@/lib/sns'

let ipCounter = 0
/** A fresh caller per test, so the in-process limiter never leaks between tests. */
function nextIp() {
  ipCounter += 1
  return `203.0.113.${ipCounter}`
}

const req = (body: unknown, ip: string) =>
  new Request('http://localhost/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest

const contactBody = { name: 'n', email: 'a@b.co', company: 'c', message: 'm' }
const supportBody = { name: 'n', email: 'a@b.co', subject: 's', message: 'm' }

describe('contact and support routes', () => {
  const originalCaptcha = process.env.REQUIRE_CAPTCHA

  beforeEach(() => {
    vi.resetModules()
    process.env.REQUIRE_CAPTCHA = 'false'
    vi.mocked(snsService.publishContactForm).mockReset()
    vi.mocked(snsService.publishContactForm).mockResolvedValue(true)
  })

  afterEach(() => {
    if (originalCaptcha === undefined) delete process.env.REQUIRE_CAPTCHA
    else process.env.REQUIRE_CAPTCHA = originalCaptcha
  })

  const routes = async () => ({
    contact: (await import('../contact/route')).POST,
    support: (await import('../support/route')).POST,
  })

  it('contact answers 503 when SNS did not accept the message', async () => {
    vi.mocked(snsService.publishContactForm).mockResolvedValue(false)
    const { contact } = await routes()
    const res = await contact(req(contactBody, nextIp()))
    expect(res.status).toBe(503)
  })

  it('support answers 503 when SNS did not accept the message', async () => {
    vi.mocked(snsService.publishContactForm).mockResolvedValue(false)
    const { support } = await routes()
    const res = await support(req(supportBody, nextIp()))
    expect(res.status).toBe(503)
  })

  it('support still accepts a ticket after the caller used up the contact allowance', async () => {
    const { contact, support } = await routes()
    const ip = nextIp()
    for (let i = 0; i < 6; i += 1) {
      expect((await contact(req(contactBody, ip))).status).toBe(200)
    }
    expect((await support(req(supportBody, ip))).status).toBe(200)
  })

  it('does not charge the limit for a submission that fails validation', async () => {
    const { support } = await routes()
    const ip = nextIp()
    for (let i = 0; i < 6; i += 1) {
      expect((await support(req({ name: 'n' }, ip))).status).toBe(400)
    }
    expect((await support(req(supportBody, ip))).status).toBe(200)
  })

  it.each([
    ['a@b.co', 200],
    ['first.last@mail.example.co.uk', 200],
    ['a@b', 400],
    ['a@b..co', 400],
    ['a b@c.co', 400],
  ])('validates the email %s', async (email, status) => {
    const { contact, support } = await routes()
    expect(
      (await contact(req({ ...contactBody, email }, nextIp()))).status
    ).toBe(status)
    expect(
      (await support(req({ ...supportBody, email }, nextIp()))).status
    ).toBe(status)
  })

  it('answers 400, not 500, to a body that is not JSON', async () => {
    const { contact, support } = await routes()
    expect((await contact(req('{not json', nextIp()))).status).toBe(400)
    expect((await support(req('{not json', nextIp()))).status).toBe(400)
  })

  it('bounds the support metadata it forwards', async () => {
    const { support } = await routes()
    const res = await support(
      req(
        {
          ...supportBody,
          metadata: { orgName: 'x'.repeat(10_000), graphId: { nested: true } },
        },
        nextIp()
      )
    )
    expect(res.status).toBe(200)
    const sent = vi.mocked(snsService.publishContactForm).mock.calls[0][0]
    expect(sent.message.length).toBeLessThan(6000)
    expect(sent.message).not.toContain('[object Object]')
  })
})
