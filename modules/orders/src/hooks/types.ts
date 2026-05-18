/**
 * Callback type for order lifecycle events.
 * Used by the orders module to allow external code (e.g. email module)
 * to react to order events without tight coupling.
 */
export interface OrderEventData {
  orderNumber: string
  customerEmail: string
  customerName: string
  items: Array<{
    productName?: string
    price: number
    quantity: number
  }>
  totalAmount: number
  shippingAddress?: {
    street: string
    city: string
    postalCode: string
    country?: string
  }
  shippingMethod?: string
  shippingCost?: number
  trackingNumber?: string
}

export type OrderEventHandler = (data: OrderEventData) => void | Promise<void>
