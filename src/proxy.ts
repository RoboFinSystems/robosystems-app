import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // M1: reject requests that bypass CloudFront by hitting the App Runner origin
  // URL directly. CloudFront injects `X-Origin-Verify` with a shared secret; if
  // the header doesn't match, refuse. Enforcement is gated on
  // ORIGIN_VERIFY_ENFORCE (shipped 'false') so the secret + CloudFront header can
  // roll out first, then enforcement is switched on with no 403 window. Also
  // fails OPEN when the secret is unset (local dev). App Runner's health check is
  // exempt via the matcher below (it hits the origin without the header).
  const originSecret = process.env.ORIGIN_VERIFY_SECRET
  const enforceOrigin = process.env.ORIGIN_VERIFY_ENFORCE === 'true'
  if (
    enforceOrigin &&
    originSecret &&
    request.headers.get('x-origin-verify') !== originSecret
  ) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const response = NextResponse.next()
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Check if running locally (localhost or 127.0.0.1)
  const isLocalhost =
    request.nextUrl.hostname === 'localhost' ||
    request.nextUrl.hostname === '127.0.0.1'

  // CloudFront CDN serving the research/blog portal's images, video, and audio
  // (the catalog + per-report assets produced by robosystems-content-machine).
  const RESEARCH_ASSETS = 'https://assets.robosystems.ai'

  // Comprehensive CSP configuration for modern web apps
  const cspDirectives = [
    "default-src 'self'",

    // Script sources - Allow Next.js, Cloudflare, analytics, and common CDNs
    isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' " +
        'https://challenges.cloudflare.com https://static.cloudflareinsights.com ' +
        'https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com ' +
        'https://www.googletagmanager.com https://www.google-analytics.com ' +
        'https://tagmanager.google.com https://analytics.google.com'
      : "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' " +
        'https://challenges.cloudflare.com https://static.cloudflareinsights.com ' +
        'https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com ' +
        'https://www.googletagmanager.com https://www.google-analytics.com ' +
        'https://tagmanager.google.com https://analytics.google.com',

    // Style sources - Allow unsafe-inline for Next.js Image component and other inline styles
    "style-src 'self' 'unsafe-inline' " +
      'https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com ' +
      'https://cdnjs.cloudflare.com https://challenges.cloudflare.com ' +
      'https://tagmanager.google.com',

    // Image sources - Allow common image hosts and data URIs
    "img-src 'self' data: blob: " +
      'https://images.unsplash.com https://cdn.jsdelivr.net https://unpkg.com ' +
      'https://cdnjs.cloudflare.com https://github.com https://avatars.githubusercontent.com ' +
      'https://raw.githubusercontent.com ' +
      'https://www.google-analytics.com https://www.googletagmanager.com ' +
      'https://ssl.gstatic.com https://www.gstatic.com ' +
      RESEARCH_ASSETS,

    // Font sources - Allow Google Fonts and common CDNs
    "font-src 'self' data: " +
      'https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com ' +
      'https://cdnjs.cloudflare.com',

    // Connection sources - APIs, WebSockets, analytics, and development
    isDevelopment || isLocalhost
      ? "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* " +
        'https://api.robosystems.ai https://staging.api.robosystems.ai ' +
        'https://cloudflareinsights.com https://static.cloudflareinsights.com ' +
        'https://www.google-analytics.com https://analytics.google.com ' +
        'https://region1.google-analytics.com https://www.googletagmanager.com ' +
        'https://tagmanager.google.com wss://ws-us3.pusher.com https://sockjs-us3.pusher.com ' +
        // Monaco Editor loads its AMD loader, workers, and source maps from
        // jsdelivr. Allow it on every route, not per-route: the CSP is fixed at
        // the initial document load and persists across client-side navigation,
        // so a route-gated allowance never applies once you navigate into the
        // editor. script-src already trusts jsdelivr app-wide.
        'https://cdn.jsdelivr.net'
      : "connect-src 'self' " +
        'https://api.robosystems.ai https://staging.api.robosystems.ai ' +
        'https://cloudflareinsights.com https://static.cloudflareinsights.com ' +
        'https://www.google-analytics.com https://analytics.google.com ' +
        'https://region1.google-analytics.com https://www.googletagmanager.com ' +
        'https://tagmanager.google.com wss://ws-us3.pusher.com https://sockjs-us3.pusher.com ' +
        'https://cdn.jsdelivr.net',

    // Frame sources - Allow Cloudflare CAPTCHA and common embeds
    "frame-src 'self' " +
      'https://challenges.cloudflare.com https://www.youtube.com https://player.vimeo.com ' +
      'https://www.google.com https://docs.google.com',

    // Media sources - Allow video and audio from common hosts
    "media-src 'self' data: blob: " +
      'https://cdn.jsdelivr.net https://unpkg.com ' +
      RESEARCH_ASSETS,

    // Object sources - Restrict to self for security
    "object-src 'none'",

    // Worker sources - Allow blob URLs for web workers
    "worker-src 'self' blob:",

    // Manifest source - PWA manifests from self
    "manifest-src 'self'",

    // Security directives
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",

    // Skip trusted types - incompatible with many third-party scripts
    // Trusted Types disabled for compatibility with Cloudflare, analytics, etc.
  ]

  // Only add upgrade-insecure-requests in production
  if (!isDevelopment) {
    cspDirectives.push('upgrade-insecure-requests')
  }

  const csp = cspDirectives.join('; ')

  // Security headers (enhanced per security review)
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Set to 0 (not the legacy '1; mode=block'): the deprecated XSS auditor can
  // itself introduce vulnerabilities in older browsers. CSP is the real defense.
  response.headers.set('X-XSS-Protection', '0')

  // Add Cross-Origin-Opener-Policy for enhanced isolation
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  // Note: COEP header removed as it blocks external assets without CORP headers

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), payment=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Run on all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     * - api/utilities/health — App Runner's health check hits the origin
     *   directly, without the CloudFront-injected X-Origin-Verify header, so it
     *   must be exempt from the M1 origin check.
     *
     * NOTE: API routes are intentionally INCLUDED now (except the health check)
     * so the M1 origin verification covers them too.
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons|api/utilities/health).*)',
  ],
}
