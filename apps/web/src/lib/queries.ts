import type { Payload } from 'payload'
import type { ProductCardData } from '@/components/shop/ProductCard'

export interface CategoryLite {
  id: string | number
  slug: string
  name: string
}

export interface ProductDetail {
  id: string | number
  slug: string
  name: string
  price: number
  currency: string
  description?: unknown
  images: Array<{ url: string; alt?: string }>
  category?: { id: string | number; slug: string; name: string } | null
  status: 'available' | 'sold' | 'hidden'
  stock: number
  dimensions?: {
    width?: number
    height?: number
    depth?: number
  }
}

export async function getCategories(payload: Payload): Promise<CategoryLite[]> {
  const result = await payload.find({
    collection: 'categories' as never,
    limit: 50,
    locale: 'en' as never,
    depth: 0,
  })
  return (result.docs as Array<Record<string, unknown>>).map((doc) => ({
    id: doc.id as string | number,
    slug: doc.slug as string,
    name: doc.name as string,
  }))
}

export interface GetProductsOptions {
  categorySlug?: string
  limit?: number
  page?: number
}

interface MediaShape {
  url?: string
  alt?: string
}

interface ProductDoc {
  id: string | number
  slug: string
  name: string
  price: number
  status?: 'available' | 'sold' | 'hidden'
  stock?: number
  category?:
    | { id: string | number; slug?: string; name?: string }
    | string
    | number
  images?: Array<{ image?: MediaShape | string | number | null } | null>
}

/**
 * Fetch products for the storefront, filtered by category slug if provided.
 * Returns lite cards already shaped for ProductCard rendering.
 */
export async function getProducts(
  payload: Payload,
  options: GetProductsOptions = {},
): Promise<{ items: ProductCardData[]; total: number; page: number; totalPages: number }> {
  const limit = options.limit ?? 24
  const page = options.page ?? 1

  const conditions: Array<Record<string, unknown>> = [
    { status: { equals: 'available' } },
  ]

  if (options.categorySlug) {
    const cat = await payload.find({
      collection: 'categories' as never,
      where: { slug: { equals: options.categorySlug } } as never,
      limit: 1,
      depth: 0,
    })
    if (cat.totalDocs === 0) {
      return { items: [], total: 0, page: 1, totalPages: 0 }
    }
    conditions.push({ category: { equals: (cat.docs[0] as { id: string | number }).id } })
  }

  const result = await payload.find({
    collection: 'products' as never,
    where: { and: conditions } as never,
    limit,
    page,
    depth: 2,
    locale: 'en' as never,
  })

  const items: ProductCardData[] = (result.docs as ProductDoc[]).map((p) => {
    const firstImage = p.images?.[0]?.image
    const imageUrl =
      firstImage && typeof firstImage === 'object' && 'url' in firstImage
        ? firstImage.url
        : undefined
    const imageAlt =
      firstImage && typeof firstImage === 'object' && 'alt' in firstImage
        ? firstImage.alt
        : undefined

    const categoryName =
      p.category && typeof p.category === 'object' && 'name' in p.category
        ? p.category.name
        : undefined

    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      currency: 'GBP',
      imageUrl: imageUrl ?? null,
      imageAlt,
      categoryName,
      status: p.status,
      stock: p.stock,
    }
  })

  return {
    items,
    total: result.totalDocs ?? 0,
    page: result.page ?? 1,
    totalPages: result.totalPages ?? 0,
  }
}

/** Fetch full product by slug for the detail page. Returns null when not found. */
export async function getProductBySlug(payload: Payload, slug: string): Promise<ProductDetail | null> {
  const result = await payload.find({
    collection: 'products' as never,
    where: { slug: { equals: slug } } as never,
    limit: 1,
    depth: 2,
    locale: 'en' as never,
  })
  if (result.totalDocs === 0) return null
  const p = result.docs[0] as ProductDoc & {
    description?: unknown
    dimensions?: { width?: number; height?: number; depth?: number }
  }

  const images: Array<{ url: string; alt?: string }> = []
  for (const entry of p.images ?? []) {
    const img = entry?.image
    if (!img || typeof img !== 'object' || !('url' in img)) continue
    const url = (img as { url?: string }).url
    if (!url) continue
    images.push({ url, alt: (img as { alt?: string }).alt })
  }

  const category =
    p.category && typeof p.category === 'object' && 'slug' in p.category
      ? {
          id: p.category.id,
          slug: p.category.slug as string,
          name: p.category.name as string,
        }
      : null

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    currency: 'GBP',
    description: p.description,
    images,
    category,
    status: p.status ?? 'available',
    stock: p.stock ?? 0,
    dimensions: p.dimensions,
  }
}

/**
 * Cross-sell helper for the order confirmation: latest available products
 * minus the items the customer just bought. Falls back to fewer than `limit`
 * if not enough exist.
 */
export async function getCrossSellProducts(
  payload: Payload,
  excludeSlugs: string[],
  limit = 4,
): Promise<ProductCardData[]> {
  const conditions: Array<Record<string, unknown>> = [{ status: { equals: 'available' } }]
  if (excludeSlugs.length > 0) {
    conditions.push({ slug: { not_in: excludeSlugs } })
  }

  const result = await payload.find({
    collection: 'products' as never,
    where: { and: conditions } as never,
    limit,
    depth: 2,
    sort: '-createdAt',
    locale: 'en' as never,
  })

  return (result.docs as ProductDoc[]).map((p) => {
    const firstImage = p.images?.[0]?.image
    const imageUrl =
      firstImage && typeof firstImage === 'object' && 'url' in firstImage
        ? (firstImage as { url?: string }).url
        : undefined
    const categoryName =
      p.category && typeof p.category === 'object' && 'name' in p.category
        ? (p.category.name as string)
        : undefined
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      currency: 'GBP',
      imageUrl: imageUrl ?? null,
      categoryName,
      status: p.status,
      stock: p.stock,
    }
  })
}

/** Related products from the same category, excluding the current product. */
export async function getRelatedProducts(
  payload: Payload,
  categoryId: string | number,
  excludeProductId: string | number,
  limit = 4,
): Promise<ProductCardData[]> {
  const result = await payload.find({
    collection: 'products' as never,
    where: {
      and: [
        { status: { equals: 'available' } },
        { category: { equals: categoryId } },
        { id: { not_equals: excludeProductId } },
      ],
    } as never,
    limit,
    depth: 2,
    locale: 'en' as never,
  })

  return (result.docs as ProductDoc[]).map((p) => {
    const firstImage = p.images?.[0]?.image
    const imageUrl =
      firstImage && typeof firstImage === 'object' && 'url' in firstImage
        ? (firstImage as { url?: string }).url
        : undefined
    const categoryName =
      p.category && typeof p.category === 'object' && 'name' in p.category
        ? (p.category.name as string)
        : undefined
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      currency: 'GBP',
      imageUrl: imageUrl ?? null,
      categoryName,
      status: p.status,
      stock: p.stock,
    }
  })
}
