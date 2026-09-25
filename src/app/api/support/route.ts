import { supportRateLimiter } from '@/lib/rate-limiter'
import { snsService } from '@/lib/sns'
import {
  getClientIp,
  isCaptchaRequired,
  verifyTurnstileToken,
} from '@/lib/turnstile-server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const METADATA_FIELD_MAX = 200

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Request body must be JSON', code: 'INVALID_JSON' },
        { status: 400 }
      )
    }
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object', code: 'INVALID_JSON' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, code: 'MISSING_FIELD' },
          { status: 400 }
        )
      }
    }

    // Enforce string types and bound field lengths on the required fields to
    // reject oversized or malformed payloads before they reach SNS.
    const fieldLimits: Array<[string, number]> = [
      ['name', 200],
      ['email', 254],
      ['subject', 300],
      ['message', 5000],
    ]
    for (const [field, maxLen] of fieldLimits) {
      const value = body[field]
      if (typeof value !== 'string' || value.length > maxLen) {
        return NextResponse.json(
          {
            error: `Invalid or too-long field: ${field}`,
            code: 'INVALID_FIELD',
          },
          { status: 400 }
        )
      }
    }

    // Validate email format
    // Domain labels exclude '.', so the match is linear in the input.
    const emailRegex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
    if (body.email.length > 254 || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // Apply rate limiting (5 requests per hour for support). Charged only for a
    // well-formed submission, and before the CAPTCHA check, which calls out to
    // Cloudflare.
    const rateLimitResult = await supportRateLimiter.check(request, 5)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.reset.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          },
        }
      )
    }

    // Verify CAPTCHA if required
    if (isCaptchaRequired()) {
      const captchaToken = body.captchaToken

      if (!captchaToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification is required' },
          { status: 400 }
        )
      }

      const clientIp = getClientIp(request)
      const verifyResult = await verifyTurnstileToken(captchaToken, clientIp)

      if (!verifyResult.success) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed' },
          { status: 400 }
        )
      }
    }

    // Build metadata section for the message. The client sends it, so only
    // bounded strings are forwarded.
    const rawMetadata =
      body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
    const metadataField = (key: string): string | undefined => {
      const value = rawMetadata[key]
      return typeof value === 'string' && value
        ? value.slice(0, METADATA_FIELD_MAX)
        : undefined
    }
    const metadata = {
      orgName: metadataField('orgName'),
      orgId: metadataField('orgId'),
      orgType: metadataField('orgType'),
      graphName: metadataField('graphName'),
      graphId: metadataField('graphId'),
      userRole: metadataField('userRole'),
    }
    const metadataLines = [
      metadata.orgName && `Organization: ${metadata.orgName}`,
      metadata.orgId && `Org ID: ${metadata.orgId}`,
      metadata.orgType && `Org Type: ${metadata.orgType}`,
      metadata.graphName && `Graph: ${metadata.graphName}`,
      metadata.graphId && `Graph ID: ${metadata.graphId}`,
      metadata.userRole && `Role: ${metadata.userRole}`,
    ].filter(Boolean)

    const metadataSection =
      metadataLines.length > 0
        ? `\n\n--- Context ---\n${metadataLines.join('\n')}`
        : ''

    // Send SNS notification via the contact form publisher. A ticket SNS did
    // not accept is not "sent".
    const delivered = await snsService.publishContactForm({
      name: body.name,
      email: body.email,
      company: metadata.orgName || 'N/A',
      message: `[Subject: ${body.subject}]\n\n${body.message}${metadataSection}`,
      formType: 'support',
    })

    if (!delivered) {
      return NextResponse.json(
        {
          error:
            'Your message could not be delivered. Please try again shortly.',
          code: 'SUBMISSION_NOT_DELIVERED',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: 'Support message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    const errorLog = {
      event: 'support_submission_error',
      endpoint: '/api/support',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(errorLog))
    } else {
      console.error('Support submission error:', errorLog)
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
