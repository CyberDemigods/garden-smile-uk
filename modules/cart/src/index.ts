import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'

export interface CartModuleOptions {
  /** localStorage key for cart data. Default: 'demicommerce-cart' */
  storageKey?: string
}

export function cartModule(_options?: CartModuleOptions): DemiModule {
  return createModule({
    slug: 'cart',
    name: 'Cart',
    version: '0.1.0',
    dependencies: { products: '^0.1.0' },
  })
}

export { useCart, type CartItem } from './use-cart.ts'
