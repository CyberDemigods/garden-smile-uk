import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Bulk-insert reviews endpoint. POST a JSON array of reviews; each item is
 * upserted (skipped if a review with the same title for the same product
 * already exists). Guarded by SEED_SECRET.
 *
 *   curl -X POST -H "Authorization: Bearer $SEED_SECRET" \
 *        -H "Content-Type: application/json" \
 *        -d '[{ productSlug, rating, title, comment, guestName, source, sourceUrl, featured }, ...]' \
 *        https://garden-smile-uk.cyberdemigods.com/dev-seed/reviews
 */

interface ReviewInput {
  productSlug?: string
  rating: number
  title: string
  comment: string
  guestName: string
  source?: 'native' | 'ebay' | 'allegro' | 'google' | 'other'
  sourceUrl?: string
  featured?: boolean
  verifiedPurchase?: boolean
}

export async function POST(request: Request) {
  const expected = process.env.SEED_SECRET
  if (!expected) {
    return Response.json({ error: 'SEED_SECRET not configured' }, { status: 500 })
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: ReviewInput[]
  try {
    body = (await request.json()) as ReviewInput[]
    if (!Array.isArray(body)) throw new Error('Body must be a JSON array of reviews')
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  const created: string[] = []
  const skipped: string[] = []
  const errors: Array<{ title: string; message: string }> = []

  for (const r of body) {
    try {
      let productId: string | number | undefined
      if (r.productSlug) {
        const found = await payload.find({
          collection: 'products' as never,
          where: { slug: { equals: r.productSlug } } as never,
          limit: 1,
        })
        if (found.totalDocs > 0) {
          productId = (found.docs[0] as { id: string | number }).id
        }
      }

      // Dedupe: same title + same product (or null product) is treated as duplicate.
      const dedupeConditions: Array<Record<string, unknown>> = [{ title: { equals: r.title } }]
      if (productId !== undefined) dedupeConditions.push({ product: { equals: productId } })
      const existing = await payload.find({
        collection: 'reviews' as never,
        where: { and: dedupeConditions } as never,
        limit: 1,
      })
      if (existing.totalDocs > 0) {
        skipped.push(r.title)
        continue
      }

      await payload.create({
        collection: 'reviews' as never,
        data: {
          ...(productId !== undefined && { product: productId }),
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          guestName: r.guestName,
          status: 'approved',
          verifiedPurchase: r.verifiedPurchase ?? true,
          source: r.source ?? 'native',
          ...(r.sourceUrl && { sourceUrl: r.sourceUrl }),
          featured: r.featured ?? false,
        } as never,
      })
      created.push(r.title)
    } catch (err) {
      errors.push({
        title: r.title,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return Response.json({ created, skipped, errors })
}
