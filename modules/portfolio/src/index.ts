import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { Field } from 'payload'
import { PortfolioCategories } from './collections/PortfolioCategories.ts'
import { createPortfolioWorksCollection } from './collections/PortfolioWorks.ts'

export interface PortfolioModuleOptions {
  /** Link portfolio works to products. Default: false */
  linkToProducts?: boolean
  /** Additional fields on portfolio works */
  extraFields?: Field[]
}

export function portfolioModule(options?: PortfolioModuleOptions): DemiModule {
  const linkToProducts = options?.linkToProducts ?? false

  const dependencies: Record<string, string> = { media: '^0.1.0' }
  if (linkToProducts) {
    dependencies['products'] = '^0.1.0'
  }

  return createModule({
    slug: 'portfolio',
    name: 'Portfolio',
    version: '0.1.0',
    dependencies,
    collections: [
      PortfolioCategories,
      createPortfolioWorksCollection({
        linkToProducts,
        extraFields: options?.extraFields,
      }),
    ],
  })
}
