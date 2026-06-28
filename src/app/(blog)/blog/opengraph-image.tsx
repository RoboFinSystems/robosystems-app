import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'RoboSystems Blog'

export default function Image() {
  return renderOgImage({
    eyebrow: 'RoboSystems Blog',
    title: 'Insights on graph databases, AI, and financial intelligence',
  })
}
