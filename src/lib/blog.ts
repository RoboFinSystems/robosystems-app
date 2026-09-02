// Blog catalog access. Posts are authored and published by robosystems-content-machine to
// s3://robosystems-content/blog/ and served via the CloudFront CDN: a blog/index.json catalog
// plus a post.md (and optional narration mp3) per post. Mirrors the research catalog pattern;
// fetched server-side (SSG/ISR) so the blog stays statically rendered for SEO.
//
// The catalog is shared with roboledger-app: each entry carries a `site`, and each app lists
// the posts in its own lane. A post moves between the sites by editing one frontmatter line
// in the content machine and reindexing; next.config.js redirects the moved slugs.

const BLOG_CATALOG_URL =
  process.env.NEXT_PUBLIC_BLOG_CATALOG_URL ||
  'https://assets.robosystems.ai/blog/index.json'

/** The lane this app lists. A catalog entry without a `site` is a robosystems.ai post. */
export const BLOG_SITE = 'robosystems'

export interface BlogPost {
  slug: string
  site: string
  title: string
  date: string
  author: string
  excerpt: string
  metaDescription?: string
  tags?: string[]
  keywords?: string[]
  readingTime?: string
  canonicalUrl?: string
  narrationUrl?: string
  content?: string // raw markdown body; only populated by getPostBySlug
}

interface CatalogEntry {
  slug: string
  site?: string
  title: string
  date: string
  author: string
  excerpt: string
  metaDescription?: string
  tags?: string[]
  keywords?: string[]
  reading_time_minutes?: number
  canonical_url?: string
  assets?: { body?: string; narration_mp3?: string }
}

function toPost(e: CatalogEntry): BlogPost {
  return {
    slug: e.slug,
    site: e.site ?? BLOG_SITE,
    title: e.title,
    date: e.date,
    author: e.author,
    excerpt: e.excerpt,
    metaDescription: e.metaDescription,
    tags: e.tags ?? [],
    keywords: e.keywords,
    readingTime: e.reading_time_minutes
      ? `${e.reading_time_minutes} min read`
      : undefined,
    canonicalUrl: e.canonical_url,
    narrationUrl: e.assets?.narration_mp3,
  }
}

async function fetchCatalog(revalidate = 300): Promise<CatalogEntry[]> {
  const res = await fetch(BLOG_CATALOG_URL, { next: { revalidate } })
  if (!res.ok) throw new Error(`Blog catalog fetch failed: ${res.status}`)
  const data = (await res.json()) as { posts?: CatalogEntry[] }
  return data.posts ?? []
}

/** This lane's posts, newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const entries = await fetchCatalog()
    return entries
      .map(toPost)
      .filter((p) => p.site === BLOG_SITE)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error loading blog catalog:', error)
    return []
  }
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return posts.map((p) => p.slug)
}

/**
 * One post with its markdown body, whatever its site. Deliberately not filtered by lane: a
 * post that moved to roboledger.ai keeps rendering here (with the catalog's canonical, which
 * already names its new home) until the redirect in next.config.js ships, so the move never
 * opens a 404 window between the reindex and the deploy.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const entries = await fetchCatalog()
    const entry = entries.find((e) => e.slug === slug)
    if (!entry) return null
    const post = toPost(entry)
    if (entry.assets?.body) {
      const res = await fetch(entry.assets.body, { next: { revalidate: 300 } })
      if (res.ok) post.content = await res.text()
    }
    return post
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error)
    return null
  }
}
