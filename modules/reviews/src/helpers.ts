import type { Payload } from 'payload'

export interface ReviewItem {
  id: string | number
  rating: number
  title: string
  comment: string
  authorName: string
  verifiedPurchase: boolean
  createdAt: string
  source?: 'native' | 'ebay' | 'allegro' | 'google' | 'other'
  sourceUrl?: string
  productSlug?: string
  productName?: string
}

export interface RatingStats {
  /** Average rating (0 when there are no approved reviews). */
  average: number
  /** Total number of approved reviews. */
  total: number
  /** Count per star (1..5). */
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number }
}

const EMPTY_STATS: RatingStats = {
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
}

/**
 * Aggregate approved reviews for a product into average + count + distribution.
 * Reads up to 1000 reviews per product (raise limit if you expect more).
 */
export async function getProductRatingStats(
  payload: Payload,
  productId: string | number,
): Promise<RatingStats> {
  try {
    const result = await payload.find({
      collection: 'reviews' as never,
      where: {
        and: [
          { product: { equals: productId } },
          { status: { equals: 'approved' } },
        ],
      } as never,
      limit: 1000,
      depth: 0,
      pagination: false,
    })

    const reviews = (result.docs ?? []) as Array<{ rating?: number }>
    if (reviews.length === 0) return EMPTY_STATS

    const distribution: RatingStats['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    for (const r of reviews) {
      const rating = Math.max(1, Math.min(5, Math.round(r.rating ?? 0))) as 1 | 2 | 3 | 4 | 5
      distribution[rating] += 1
      sum += rating
    }

    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      total: reviews.length,
      distribution,
    }
  } catch {
    return EMPTY_STATS
  }
}

export interface GetReviewsOptions {
  limit?: number
  page?: number
  /** Sort: 'newest' (default), 'oldest', 'rating-desc', 'rating-asc'. */
  sort?: 'newest' | 'oldest' | 'rating-desc' | 'rating-asc'
  /** Filter by exact star rating (1..5). */
  rating?: 1 | 2 | 3 | 4 | 5
  /** Only verified-purchase reviews. */
  verifiedOnly?: boolean
}

const SORT_MAP: Record<NonNullable<GetReviewsOptions['sort']>, string> = {
  newest: '-createdAt',
  oldest: 'createdAt',
  'rating-desc': '-rating',
  'rating-asc': 'rating',
}

/**
 * Fetch a paginated list of approved reviews for a product, normalised for
 * storefront rendering (author name resolved from user.name or guestName).
 */
export async function getProductReviews(
  payload: Payload,
  productId: string | number,
  options: GetReviewsOptions = {},
): Promise<{ items: ReviewItem[]; total: number; page: number; totalPages: number }> {
  const limit = options.limit ?? 10
  const page = options.page ?? 1
  const sort = SORT_MAP[options.sort ?? 'newest']

  const conditions: Array<Record<string, unknown>> = [
    { product: { equals: productId } },
    { status: { equals: 'approved' } },
  ]
  if (options.rating) conditions.push({ rating: { equals: options.rating } })
  if (options.verifiedOnly) conditions.push({ verifiedPurchase: { equals: true } })

  try {
    const result = await payload.find({
      collection: 'reviews' as never,
      where: { and: conditions } as never,
      limit,
      page,
      sort,
      depth: 1,
    })

    const items: ReviewItem[] = (result.docs as Array<Record<string, unknown>>).map((doc) => {
      const user = doc.user as { name?: string; email?: string } | undefined | null
      const guestName = doc.guestName as string | undefined
      const authorName = user?.name || guestName || 'Anonymous'
      const product = doc.product as { slug?: string; name?: string } | undefined | null
      return {
        id: doc.id as string | number,
        rating: doc.rating as number,
        title: doc.title as string,
        comment: doc.comment as string,
        authorName,
        verifiedPurchase: Boolean(doc.verifiedPurchase),
        createdAt: doc.createdAt as string,
        source: (doc.source as ReviewItem['source']) ?? 'native',
        sourceUrl: doc.sourceUrl as string | undefined,
        productSlug: product?.slug,
        productName: product?.name,
      }
    })

    return {
      items,
      total: result.totalDocs ?? 0,
      page: result.page ?? 1,
      totalPages: result.totalPages ?? 1,
    }
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0 }
  }
}

/**
 * Fetch reviews flagged as `featured` (or fall back to the highest-rated approved ones)
 * for rendering on a homepage testimonials section.
 */
export async function getFeaturedReviews(
  payload: Payload,
  limit = 6,
): Promise<ReviewItem[]> {
  try {
    let result = await payload.find({
      collection: 'reviews' as never,
      where: {
        and: [
          { status: { equals: 'approved' } },
          { featured: { equals: true } },
        ],
      } as never,
      limit,
      depth: 1,
      sort: '-createdAt',
    })

    // Fallback: if no featured reviews are explicitly flagged, surface the
    // most recent 5-star approved ones so the section never looks empty.
    if ((result.totalDocs ?? 0) === 0) {
      result = await payload.find({
        collection: 'reviews' as never,
        where: {
          and: [
            { status: { equals: 'approved' } },
            { rating: { greater_than_equal: 4 } },
          ],
        } as never,
        limit,
        depth: 1,
        sort: '-createdAt',
      })
    }

    return (result.docs as Array<Record<string, unknown>>).map((doc) => {
      const user = doc.user as { name?: string } | undefined | null
      const guestName = doc.guestName as string | undefined
      const authorName = user?.name || guestName || 'Anonymous'
      const product = doc.product as { slug?: string; name?: string } | undefined | null
      return {
        id: doc.id as string | number,
        rating: doc.rating as number,
        title: doc.title as string,
        comment: doc.comment as string,
        authorName,
        verifiedPurchase: Boolean(doc.verifiedPurchase),
        createdAt: doc.createdAt as string,
        source: (doc.source as ReviewItem['source']) ?? 'native',
        sourceUrl: doc.sourceUrl as string | undefined,
        productSlug: product?.slug,
        productName: product?.name,
      }
    })
  } catch {
    return []
  }
}

/**
 * Fetch all approved reviews for a storefront carousel. Sorts featured first,
 * then by rating descending, then by most recent.
 */
export async function getAllApprovedReviews(
  payload: Payload,
  limit = 50,
): Promise<ReviewItem[]> {
  try {
    const result = await payload.find({
      collection: 'reviews' as never,
      where: { status: { equals: 'approved' } } as never,
      limit,
      depth: 1,
      sort: '-createdAt',
    })

    const items = (result.docs as Array<Record<string, unknown>>).map((doc) => {
      const user = doc.user as { name?: string } | undefined | null
      const guestName = doc.guestName as string | undefined
      const authorName = user?.name || guestName || 'Anonymous'
      const product = doc.product as { slug?: string; name?: string } | undefined | null
      return {
        id: doc.id as string | number,
        rating: doc.rating as number,
        title: doc.title as string,
        comment: doc.comment as string,
        authorName,
        verifiedPurchase: Boolean(doc.verifiedPurchase),
        createdAt: doc.createdAt as string,
        source: (doc.source as ReviewItem['source']) ?? 'native',
        sourceUrl: doc.sourceUrl as string | undefined,
        productSlug: product?.slug,
        productName: product?.name,
        _featured: Boolean(doc.featured),
      }
    })

    // Sort: featured first, then rating desc, then newest.
    items.sort((a, b) => {
      if (a._featured !== b._featured) return a._featured ? -1 : 1
      if (a.rating !== b.rating) return b.rating - a.rating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return items.map(({ _featured, ...rest }) => {
      void _featured
      return rest
    })
  } catch {
    return []
  }
}
