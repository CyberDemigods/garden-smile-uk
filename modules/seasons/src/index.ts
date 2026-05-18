import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { SeasonsCollection } from './collections/Seasons.ts'

export interface SeasonsModuleOptions {
  /** When true, adds a `seasons` relationship array to the Products collection. Default: true. */
  linkToProducts?: boolean
}

export function seasonsModule(options?: SeasonsModuleOptions): DemiModule {
  const linkToProducts = options?.linkToProducts ?? true

  return createModule({
    slug: 'seasons',
    name: 'Seasons',
    version: '0.1.0',
    dependencies: { products: '^0.1.0', themes: '^0.1.0' },
    collections: [SeasonsCollection],
    extendCollections: linkToProducts
      ? {
          products: {
            fields: [
              {
                name: 'seasons',
                type: 'relationship',
                relationTo: 'seasons' as never,
                hasMany: true,
                label: 'Seasons',
                admin: {
                  position: 'sidebar',
                  description: 'Tag this product with one or more seasonal collections.',
                },
              },
            ],
          },
        }
      : undefined,
  })
}

export { SeasonsCollection }
