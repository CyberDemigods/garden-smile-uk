import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { FaqCategoriesCollection } from './collections/FaqCategories.ts'
import { FaqItemsCollection } from './collections/FaqItems.ts'

export interface FaqModuleOptions {
  /** Reserved for future options (e.g. enableSearch, enableComments). */
  _placeholder?: never
}

export function faqModule(_options?: FaqModuleOptions): DemiModule {
  return createModule({
    slug: 'faq',
    name: 'FAQ',
    version: '0.1.0',
    collections: [FaqCategoriesCollection, FaqItemsCollection],
  })
}

export { FaqCategoriesCollection, FaqItemsCollection }
