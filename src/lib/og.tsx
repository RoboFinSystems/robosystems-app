// Shared renderer for dynamically generated 1200×630 OpenGraph/Twitter images
// (Next file conventions: opengraph-image.tsx / twitter-image.tsx → ImageResponse/Satori).
// Used for blog posts/index, which have no per-item share image of their own. Uses the
// built-in default font (no TTF needed). Brand gradient from the cross-app brand map in
// src/lib/core/auth-core/config.ts (robosystems = cyan → blue → indigo).

import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// ImageResponse answers `max-age=0, must-revalidate` in production, which would make
// every fetch re-render the card on the app instance. A card changes only when a post's
// title or excerpt does, so a day at the CDN is fresh enough.
export const CARD_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'

const GRADIENT = 'linear-gradient(135deg, #06B6D4, #3B7AF5 55%, #6366F1)'
const ACCENT = '#3B7AF5'
const DOMAIN = 'robosystems.ai'

export function renderOgImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 66 : 78
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '72px 80px',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '14px',
          backgroundImage: GRADIENT,
        }}
      />
      <div
        style={{
          display: 'flex',
          fontSize: 32,
          fontWeight: 600,
          color: ACCENT,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#9CA3AF',
              marginTop: 28,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: '#6B7280' }}>
        {DOMAIN}
      </div>
    </div>,
    { ...OG_SIZE, headers: { 'cache-control': CARD_CACHE_CONTROL } }
  )
}
