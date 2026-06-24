// Blog catalog access. Posts are authored and published by robosystems-content-machine to
// s3://robosystems-content/blog/ and served via the CloudFront CDN: a blog/index.json catalog
// plus a post.md (and optional narration mp3) per post. Mirrors the research catalog pattern;
// fetched server-side (SSG/ISR) so the blog stays statically rendered for SEO.

const BLOG_CATALOG_URL =
  process.env.NEXT_PUBLIC_BLOG_CATALOG_URL ||
  'https://assets.robosystems.ai/blog/index.json'

export interface BlogPost {
  slug: string
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

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const entries = await fetchCatalog()
    return entries
      .map(toPost)
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
