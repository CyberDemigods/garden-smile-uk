import type { BasePayload, Payload } from 'payload'

export interface SearchResultItem {
  id: string
  type: 'product' | 'category' | 'post' | 'page'
  title: string
  description?: string
  href: string
  imageUrl?: string
}

export interface SearchResults {
  products: SearchResultItem[]
  categories: SearchResultItem[]
  posts: SearchResultItem[]
  pages: SearchResultItem[]
  total: number
}

const EMPTY: SearchResults = {
  products: [],
  categories: [],
  posts: [],
  pages: [],
  total: 0,
}

export interface SearchConfig {
  productSlug?: string
  categorySlug?: string
  blogPostSlug?: string
  pageSlug?: string
  productHrefPrefix?: string
  categoryHrefPrefix?: string
  blogHrefPrefix?: string
  pageHrefPrefix?: string
}

const DEFAULTS: Required<SearchConfig> = {
  productSlug: 'products',
  categorySlug: 'categories',
  blogPostSlug: 'blog-posts',
  pageSlug: 'pages',
  productHrefPrefix: '/product/',
  categoryHrefPrefix: '/shop?category=',
  blogHrefPrefix: '/blog/',
  pageHrefPrefix: '/page/',
}

export async function searchAll(
  payload: Payload | BasePayload,
  query: string,
  options?: { locale?: string; limit?: number; config?: SearchConfig },
): Promise<SearchResults> {
  const q = query.trim()
  if (q.length < 2) return EMPTY

  const limit = options?.limit ?? 5
  const locale = options?.locale
  const cfg = { ...DEFAULTS, ...options?.config }

  const localeArg = locale ? { locale: locale as never } : {}

  const [products, categories, posts, pages] = await Promise.all([
    payload
      .find({
        collection: cfg.productSlug as never,
        where: {
          and: [
            { status: { equals: 'available' } },
            { or: [{ name: { like: q } }, { slug: { like: q } }] },
          ],
        },
        limit,
        depth: 1,
        ...localeArg,
      })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
    payload
      .find({
        collection: cfg.categorySlug as never,
        where: { or: [{ name: { like: q } }, { slug: { like: q } }] },
        limit,
        depth: 0,
        ...localeArg,
      })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
    payload
      .find({
        collection: cfg.blogPostSlug as never,
        where: {
          and: [
            { status: { equals: 'published' } },
            { or: [{ title: { like: q } }, { excerpt: { like: q } }] },
          ],
        },
        limit,
        depth: 1,
        ...localeArg,
      })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
    payload
      .find({
        collection: cfg.pageSlug as never,
        where: { or: [{ title: { like: q } }, { slug: { like: q } }] },
        limit,
        depth: 0,
        ...localeArg,
      })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
  ])

  const productItems: SearchResultItem[] = products.docs.map((p) => {
    const doc = p as Record<string, unknown>
    const images = doc.images as Array<{ image?: { url?: string } }> | undefined
    return {
      id: doc.id as string,
      type: 'product',
      title: doc.name as string,
      description: typeof doc.description === 'string' ? doc.description : undefined,
      href: `${cfg.productHrefPrefix}${doc.slug as string}`,
      imageUrl: images?.[0]?.image?.url,
    }
  })

  const categoryItems: SearchResultItem[] = categories.docs.map((c) => {
    const doc = c as Record<string, unknown>
    return {
      id: doc.id as string,
      type: 'category',
      title: doc.name as string,
      href: `${cfg.categoryHrefPrefix}${doc.slug as string}`,
    }
  })

  const postItems: SearchResultItem[] = posts.docs.map((p) => {
    const doc = p as Record<string, unknown>
    const cover = doc.coverImage as { url?: string } | undefined
    return {
      id: doc.id as string,
      type: 'post',
      title: doc.title as string,
      description: doc.excerpt as string | undefined,
      href: `${cfg.blogHrefPrefix}${doc.slug as string}`,
      imageUrl: cover?.url,
    }
  })

  const pageItems: SearchResultItem[] = pages.docs.map((p) => {
    const doc = p as Record<string, unknown>
    return {
      id: doc.id as string,
      type: 'page',
      title: doc.title as string,
      href: `${cfg.pageHrefPrefix}${doc.slug as string}`,
    }
  })

  return {
    products: productItems,
    categories: categoryItems,
    posts: postItems,
    pages: pageItems,
    total:
      productItems.length + categoryItems.length + postItems.length + pageItems.length,
  }
}
