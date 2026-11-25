import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'RoboSystems Blog'

export default function Image() {
  return renderOgImage({
    eyebrow: 'RoboSystems Blog',
    title: 'The open-source knowledge graph for finance',
  })
}
