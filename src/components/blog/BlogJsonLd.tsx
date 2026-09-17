// Schema.org JSON-LD for the blog. App-local, and mirrored in roboledger-app so the two
// lanes stay aligned: a per-post BlogPosting (+ AudioObject when a narration exists)
// with a BreadcrumbList, and an ItemList for the index hub. The BlogPosting image is the
// post's own 1200×630 card, served at a stable path (`/blog/{slug}/og.png`) because the
// opengraph-image convention's URL carries a build-generated suffix that structured data
// cannot name.

import type { BlogPost } from '@/lib/blog'

const ORG = {
  name: 'RoboSystems',
  url: 'https://robosystems.ai',
  logo: 'https://robosystems.ai/images/logos/robosystems-icon.png',
}

/** The RSS feed, advertised from the blog's pages with `<link rel="alternate">`. */
export const BLOG_FEED = [
  { url: `${ORG.url}/blog/feed.xml`, title: 'RoboSystems Blog' },
]

export const BLOG_DESCRIPTION =
  'Insights on graph databases, AI-powered analytics, and the future of business intelligence'

/** One JSON-LD block. `</` is escaped so post text can never break out of the script. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** Per-post structured data for `/blog/{slug}`: BlogPosting + BreadcrumbList. */
export function BlogJsonLd({
  post,
  baseUrl = ORG.url,
}: {
  post: BlogPost
  baseUrl?: string
}) {
  const url = `${baseUrl}/blog/${post.slug}`
  const keywords = (post.keywords?.length ? post.keywords : post.tags)?.join(
    ', '
  )

  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: ORG.name,
      url: ORG.url,
      logo: { '@type': 'ImageObject', url: ORG.logo },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: {
      '@type': 'ImageObject',
      url: `${url}/og.png`,
      width: 1200,
      height: 630,
    },
    keywords: keywords || undefined,
    audio: post.narrationUrl
      ? {
          '@type': 'AudioObject',
          contentUrl: post.narrationUrl,
          name: `${post.title} — narration`,
        }
      : undefined,
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <>
      <JsonLd data={blogPosting} />
      <JsonLd data={breadcrumb} />
    </>
  )
}

/** ItemList structured data for the `/blog` index — the post hub as a list. */
export function BlogListJsonLd({
  posts,
  baseUrl = ORG.url,
}: {
  posts: BlogPost[]
  baseUrl?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RoboSystems Blog',
    description: BLOG_DESCRIPTION,
    itemListElement: posts.map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${baseUrl}/blog/${post.slug}`,
      name: post.title,
    })),
  }
  return <JsonLd data={data} />
}
