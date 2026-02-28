import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  content?: string
  readingTime?: string
  tags?: string[]
  featured?: boolean
  coverImage?: string
  coverVideo?: string
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, `${realSlug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const { data, content } = matter(fileContents)

    // Process markdown to HTML
    const processedContent = await remark().use(html).process(content)
    const contentHtml = processedContent.toString()

    // Calculate reading time
    const stats = readingTime(content)

    return {
      slug: realSlug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      author: data.author || 'RoboSystems Team',
      excerpt: data.excerpt || content.substring(0, 160) + '...',
      content: contentHtml,
      readingTime: stats.text,
      tags: data.tags || [],
      featured: data.featured || false,
      coverImage: data.coverImage || null,
      coverVideo: data.coverVideo || null,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPosts(): BlogPost[] {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true })
      return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const allPosts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        // Calculate reading time
        const stats = readingTime(content)

        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          author: data.author || 'RoboSystems Team',
          excerpt: data.excerpt || content.substring(0, 160) + '...',
          readingTime: stats.text,
          tags: data.tags || [],
          featured: data.featured || false,
          coverImage: data.coverImage || null,
          coverVideo: data.coverVideo || null,
        }
      })

    // Sort posts by featured first, then by date (newest first)
    return allPosts.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

export function getPostSlugs(): string[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return []
    }
    return fs
      .readdirSync(postsDirectory)
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => fileName.replace(/\.md$/, ''))
  } catch (error) {
    console.error('Error getting post slugs:', error)
    return []
  }
}
