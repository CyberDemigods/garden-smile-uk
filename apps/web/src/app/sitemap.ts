import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021'

const STATIC_PATHS = [
  '/',
  '/shop',
  '/wishlist',
  '/about',
  '/contact',
  '/shipping',
  '/returns',
  '/privacy',
  '/terms',
  '/cookies',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const [products, categories] = await Promise.all([
    payload.find({
      collection: 'products' as never,
      where: { status: { equals: 'available' } } as never,
      limit: 1000,
      depth: 0,
      locale: 'en' as never,
      pagination: false,
    }),
    payload.find({
      collection: 'categories' as never,
      limit: 200,
      depth: 0,
      locale: 'en' as never,
      pagination: false,
    }),
  ])

  const now = new Date()

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1.0 : 0.7,
  }))

  const productEntries = (products.docs as unknown as Array<{ slug: string; updatedAt?: string }>).map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryEntries = (categories.docs as unknown as Array<{ slug: string }>).map((c) => ({
    url: `${BASE_URL}/shop?category=${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...productEntries, ...categoryEntries]
}
