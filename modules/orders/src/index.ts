import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { createOrdersCollection } from './collections/Orders.ts'
import { createOrderEventsHook } from './hooks/order-events.ts'
import { markProductsSoldHook } from './hooks/mark-products-sold.ts'
import type { OrderEventHandler } from './hooks/types.ts'

export interface OrdersModuleOptions {
  /** Handlers called when a new order is created */
  onCreated?: OrderEventHandler[]
  /** Handlers called when an order transitions to 'paid' */
  onPaid?: OrderEventHandler[]
  /** Handlers called when an order transitions to 'shipped' */
  onShipped?: OrderEventHandler[]
  /** Automatically mark products as 'sold' when order is paid. Default: true */
  autoMarkSold?: boolean
}

export function ordersModule(options?: OrdersModuleOptions): DemiModule {
  const autoMarkSold = options?.autoMarkSold ?? true

  const afterChangeHooks = [
    createOrderEventsHook({
      onCreated: options?.onCreated,
      onPaid: options?.onPaid,
      onShipped: options?.onShipped,
    }),
  ]

  if (autoMarkSold) {
    afterChangeHooks.push(markProductsSoldHook)
  }

  return createModule({
    slug: 'orders',
    name: 'Orders',
    version: '0.1.0',
    dependencies: { products: '^0.1.0' },
    collections: [createOrdersCollection({ afterChangeHooks })],
  })
}

export type { OrderEventData, OrderEventHandler } from './hooks/types.ts'
export { createOrderEventsHook } from './hooks/order-events.ts'
export { markProductsSoldHook } from './hooks/mark-products-sold.ts'
