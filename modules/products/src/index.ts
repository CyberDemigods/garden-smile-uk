import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { Field } from 'payload'
import { createProductsCollection } from './collections/Products.ts'
import { Categories } from './collections/Categories.ts'

export interface ProductsModuleOptions {
  /** Enable Omnibus directive price history tracking. Default: true */
  enablePriceHistory?: boolean
  /** Enable product dimensions fields (width/height/depth). Default: false */
  enableDimensions?: boolean
  /** Additional fields to add to the Products collection */
  extraFields?: Field[]
}

export function productsModule(options?: ProductsModuleOptions): DemiModule {
  const enablePriceHistory = options?.enablePriceHistory ?? true
  const enableDimensions = options?.enableDimensions ?? false

  return createModule({
    slug: 'products',
    name: 'Products',
    version: '0.1.0',
    dependencies: { media: '^0.1.0' },
    collections: [
      createProductsCollection({
        enablePriceHistory,
        enableDimensions,
        extraFields: options?.extraFields,
      }),
      Categories,
    ],
  })
}

export { autoSlugHook } from './hooks/auto-slug.ts'
export { priceHistoryHook } from './hooks/price-history.ts'
