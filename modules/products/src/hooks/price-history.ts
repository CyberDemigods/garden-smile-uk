import type { CollectionBeforeChangeHook } from 'payload'

interface PriceHistoryEntry {
  price: number
  changedAt: string
}

function getLowestPrice30d(priceHistory: PriceHistoryEntry[], currentPrice: number): number {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentPrices = priceHistory
    .filter((entry) => new Date(entry.changedAt) >= thirtyDaysAgo)
    .map((entry) => entry.price)

  recentPrices.push(currentPrice)

  return Math.min(...recentPrices)
}

/**
 * Payload beforeChange hook that tracks price history and calculates
 * the lowest price in the last 30 days (EU Omnibus directive compliance).
 */
export const priceHistoryHook: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data) return data

  const history: PriceHistoryEntry[] = data.priceHistory || originalDoc?.priceHistory || []

  if (operation === 'create') {
    data.priceHistory = [{ price: data.price, changedAt: new Date().toISOString() }]
    data.lowestPrice30d = data.price
  } else if (operation === 'update' && originalDoc && data.price !== originalDoc.price) {
    const updatedHistory = [
      ...history,
      { price: originalDoc.price as number, changedAt: new Date().toISOString() },
    ]
    data.priceHistory = updatedHistory
    data.lowestPrice30d = getLowestPrice30d(updatedHistory, data.price as number)
  } else {
    data.lowestPrice30d = getLowestPrice30d(history, (data.price ?? originalDoc?.price) as number)
  }

  return data
}
