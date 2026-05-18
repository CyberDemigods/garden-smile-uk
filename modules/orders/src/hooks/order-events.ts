import type { CollectionAfterChangeHook } from 'payload'
import type { OrderEventHandler, OrderEventData } from './types.ts'

function extractOrderEventData(doc: Record<string, unknown>): OrderEventData {
  return {
    orderNumber: doc.orderNumber as string,
    customerEmail: doc.customerEmail as string,
    customerName: doc.customerName as string,
    items: (doc.items as OrderEventData['items']) || [],
    totalAmount: doc.totalAmount as number,
    shippingAddress: doc.shippingAddress as OrderEventData['shippingAddress'],
    shippingMethod: doc.shippingMethod as string | undefined,
    shippingCost: doc.shippingCost as number | undefined,
    trackingNumber: doc.trackingNumber as string | undefined,
  }
}

/**
 * Creates an afterChange hook that dispatches order lifecycle events
 * to registered handlers. This decouples order state changes from
 * side effects (email, notifications, integrations).
 */
export function createOrderEventsHook(handlers: {
  onCreated?: OrderEventHandler[]
  onPaid?: OrderEventHandler[]
  onShipped?: OrderEventHandler[]
}): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, operation }) => {
    const data = extractOrderEventData(doc as Record<string, unknown>)

    if (operation === 'create' && handlers.onCreated) {
      for (const handler of handlers.onCreated) {
        try {
          await handler(data)
        } catch (error) {
          console.error('[orders] onCreated handler failed:', error)
        }
      }
    }

    if (
      operation === 'update' &&
      doc.status === 'paid' &&
      previousDoc?.status !== 'paid' &&
      handlers.onPaid
    ) {
      for (const handler of handlers.onPaid) {
        try {
          await handler(data)
        } catch (error) {
          console.error('[orders] onPaid handler failed:', error)
        }
      }
    }

    if (
      operation === 'update' &&
      doc.status === 'shipped' &&
      previousDoc?.status !== 'shipped' &&
      handlers.onShipped
    ) {
      for (const handler of handlers.onShipped) {
        try {
          await handler(data)
        } catch (error) {
          console.error('[orders] onShipped handler failed:', error)
        }
      }
    }

    return doc
  }
}
