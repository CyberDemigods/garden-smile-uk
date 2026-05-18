import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'

export interface CheckoutModuleOptions {
  /** Default checkout steps. Can be customized per store. */
  steps?: Array<{ id: string; label: string; order: number }>
}

export const DEFAULT_CHECKOUT_STEPS = [
  { id: 'details', label: 'Customer details', order: 1 },
  { id: 'shipping', label: 'Shipping', order: 2 },
  { id: 'summary', label: 'Summary', order: 3 },
]

export function checkoutModule(options?: CheckoutModuleOptions): DemiModule {
  const steps = options?.steps ?? DEFAULT_CHECKOUT_STEPS

  return createModule({
    slug: 'checkout',
    name: 'Checkout',
    version: '0.1.0',
    dependencies: {
      cart: '^0.1.0',
      orders: '^0.1.0',
      payments: '^0.1.0',
      'shop-settings': '^0.1.0',
    },
    onInit: (ctx) => {
      ;(ctx as unknown as Record<string, unknown>).checkoutSteps = steps
    },
  })
}

export type { CheckoutData, CheckoutResult, CheckoutStep } from './types.ts'
