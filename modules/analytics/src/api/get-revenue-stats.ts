import type { Payload } from 'payload'
import type { RevenueStats } from '../types.ts'

/**
 * Fetches revenue statistics from the orders collection.
 * Can be used in API routes or server components.
 */
export async function getRevenueStats(payload: Payload): Promise<RevenueStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const [monthlyOrders, yearlyOrders, recentOrders] = await Promise.all([
    payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'paid' } },
          { paidAt: { greater_than_equal: startOfMonth.toISOString() } },
        ],
      },
      limit: 1000,
    }),
    payload.find({
      collection: 'orders',
      where: {
        and: [
          { status: { equals: 'paid' } },
          { paidAt: { greater_than_equal: startOfYear.toISOString() } },
        ],
      },
      limit: 1000,
    }),
    payload.find({
      collection: 'orders',
      where: {
        status: { equals: 'paid' },
      },
      sort: '-paidAt',
      limit: 10,
    }),
  ])

  const monthlyRevenue = monthlyOrders.docs.reduce(
    (sum, order) => sum + ((order.totalAmount as number) || 0),
    0,
  )
  const yearlyRevenue = yearlyOrders.docs.reduce(
    (sum, order) => sum + ((order.totalAmount as number) || 0),
    0,
  )

  return {
    monthlyRevenue,
    yearlyRevenue,
    monthlyOrders: monthlyOrders.docs.length,
    yearlyOrders: yearlyOrders.docs.length,
    recentOrders: recentOrders.docs.map((order) => ({
      orderNumber: order.orderNumber as string,
      totalAmount: order.totalAmount as number,
      customerName: order.customerName as string,
      paidAt: order.paidAt as string,
    })),
  }
}
