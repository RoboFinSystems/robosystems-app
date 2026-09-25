import { getPostBySlug } from '@/lib/blog'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'RoboSystems Blog'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  // No card for a slug that is not a post, and only a short cache on the refusal so a
  // post published a moment later gets its card.
  if (!post) {
    return new Response('Not found', {
      status: 404,
      headers: { 'cache-control': 'public, max-age=60, s-maxage=60' },
    })
  }
  const excerpt = post.excerpt || ''
  // Trim to a word boundary so the subtitle never cuts mid-word.
  const subtitle =
    excerpt.length > 100
      ? `${excerpt.slice(0, 100).replace(/\s+\S*$/, '')}…`
      : excerpt
  return renderOgImage({
    eyebrow: 'RoboSystems Blog',
    title: post.title || 'RoboSystems Blog',
    subtitle,
  })
}
