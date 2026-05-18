import type { CollectionAfterChangeHook } from 'payload'

/**
 * When an order transitions to 'paid' status, mark all ordered products as 'sold'.
 * This is a decomposed hook - separated from email notifications for modularity.
 */
export const markProductsSoldHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const isPaidTransition =
    operation === 'update' &&
    doc.status === 'paid' &&
    previousDoc?.status !== 'paid'

  if (!isPaidTransition) return doc

  for (const item of doc.items || []) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product
    if (productId) {
      try {
        await req.payload.update({
          collection: 'products',
          id: productId as string,
          data: { status: 'sold' },
        })
      } catch (error) {
        console.error(`[orders] Failed to mark product ${productId as string} as sold:`, error)
      }
    }
  }

  return doc
}
