import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'

export interface WishlistModuleOptions {
  /** Reserved for future server-side persistence (per-user wishlists). */
  _placeholder?: never
}

export function wishlistModule(_options?: WishlistModuleOptions): DemiModule {
  return createModule({
    slug: 'wishlist',
    name: 'Wishlist',
    version: '0.1.0',
    dependencies: { products: '^0.1.0' },
  })
}

export { useWishlist, type WishlistItem } from './use-wishlist.ts'
