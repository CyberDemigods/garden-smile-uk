import type { Payload } from 'payload'

export interface BlogPostLite {
  id: string | number
  slug: string
  title: string
  excerpt?: string
  coverImage?: { url: string; alt?: string } | null
  publishedAt?: string
  readingTimeMinutes?: number
  category?: { slug: string; name: string } | null
  author?: { slug: string; name: string; avatar?: { url: string } | null } | null
}

export interface BlogPostDetail extends BlogPostLite {
  content: unknown
  tags: Array<{ slug: string; name: string }>
}

type AnyDoc = Record<string, unknown>

function pickMedia(value: unknown): { url: string; alt?: string } | null {
  if (!value || typeof value !== 'object' || !('url' in value)) return null
  const url = (value as { url?: string }).url
  if (!url) return null
  return { url, alt: (value as { alt?: string }).alt }
}

function pickRef(value: unknown): { slug: string; name: string; avatar?: { url: string } | null } | null {
  if (!value || typeof value !== 'object') return null
  const v = value as { slug?: string; name?: string; avatar?: unknown }
  if (!v.slug || !v.name) return null
  return {
    slug: v.slug,
    name: v.name,
    avatar: pickMedia(v.avatar),
  }
}

const WORDS_PER_MINUTE = 200

function estimateReadingTime(content: unknown): number {
  // Walk Lexical text nodes counting whitespace-separated tokens.
  let words = 0
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') {
      words += n.text.split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(n.children)) n.children.forEach(walk)
  }
  const root = (content as { root?: unknown })?.root
  if (root) walk(root)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toLite(doc: AnyDoc): BlogPostLite {
  const category = doc.category
  const author = doc.author
  return {
    id: doc.id as string | number,
    slug: doc.slug as string,
    title: doc.title as string,
    excerpt: typeof doc.excerpt === 'string' ? doc.excerpt : undefined,
    coverImage: pickMedia(doc.coverImage),
    publishedAt: typeof doc.publishedAt === 'string' ? doc.publishedAt : undefined,
    readingTimeMinutes: doc.content ? estimateReadingTime(doc.content) : undefined,
    category:
      category && typeof category === 'object' && 'slug' in category
        ? { slug: (category as AnyDoc).slug as string, name: (category as AnyDoc).name as string }
        : null,
    author: pickRef(author),
  }
}

export interface GetBlogPostsOptions {
  limit?: number
  page?: number
  categorySlug?: string
}

export async function getBlogPosts(
  payload: Payload,
  options: GetBlogPostsOptions = {},
): Promise<{ items: BlogPostLite[]; total: number; page: number; totalPages: number }> {
  const limit = options.limit ?? 12
  const page = options.page ?? 1
  const conditions: Array<Record<string, unknown>> = [{ status: { equals: 'published' } }]

  if (options.categorySlug) {
    const cat = await payload.find({
      collection: 'blog-categories' as never,
      where: { slug: { equals: options.categorySlug } } as never,
      limit: 1,
      depth: 0,
    })
    if (cat.totalDocs === 0) return { items: [], total: 0, page: 1, totalPages: 0 }
    conditions.push({ category: { equals: (cat.docs[0] as { id: string | number }).id } })
  }

  const result = await payload.find({
    collection: 'blog-posts' as never,
    where: { and: conditions } as never,
    limit,
    page,
    sort: '-publishedAt',
    depth: 2,
    locale: 'en' as never,
  })

  return {
    items: (result.docs as unknown as AnyDoc[]).map(toLite),
    total: result.totalDocs ?? 0,
    page: result.page ?? 1,
    totalPages: result.totalPages ?? 0,
  }
}

export async function getBlogPostBySlug(payload: Payload, slug: string): Promise<BlogPostDetail | null> {
  const result = await payload.find({
    collection: 'blog-posts' as never,
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
      ],
    } as never,
    limit: 1,
    depth: 2,
    locale: 'en' as never,
  })
  if (result.totalDocs === 0) return null
  const doc = result.docs[0] as AnyDoc
  const lite = toLite(doc)
  const tagsField = doc.tags
  const tags = Array.isArray(tagsField)
    ? tagsField
        .map((t): { slug: string; name: string } | null => {
          if (!t || typeof t !== 'object') return null
          const tag = t as AnyDoc
          if (!tag.slug || !tag.name) return null
          return { slug: tag.slug as string, name: tag.name as string }
        })
        .filter((x): x is { slug: string; name: string } => x !== null)
    : []
  return { ...lite, content: doc.content, tags }
}

export async function getRelatedBlogPosts(
  payload: Payload,
  categorySlug: string | undefined,
  excludeId: string | number,
  limit = 3,
): Promise<BlogPostLite[]> {
  if (!categorySlug) return []
  const cat = await payload.find({
    collection: 'blog-categories' as never,
    where: { slug: { equals: categorySlug } } as never,
    limit: 1,
    depth: 0,
  })
  if (cat.totalDocs === 0) return []
  const categoryId = (cat.docs[0] as { id: string | number }).id

  const result = await payload.find({
    collection: 'blog-posts' as never,
    where: {
      and: [
        { status: { equals: 'published' } },
        { category: { equals: categoryId } },
        { id: { not_equals: excludeId } },
      ],
    } as never,
    limit,
    sort: '-publishedAt',
    depth: 2,
    locale: 'en' as never,
  })

  return (result.docs as unknown as AnyDoc[]).map(toLite)
}
