import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { Field } from 'payload'
import { createPagesCollection } from './collections/Pages.ts'
import { HomePageGlobal } from './globals/HomePage.ts'

export interface CmsModuleOptions {
  /** Enable SEO fields on pages. Default: true */
  enableSeo?: boolean
  /** Enable navigation placement fields. Default: true */
  enableNavPlacement?: boolean
  /** Additional fields for the Pages collection */
  extraFields?: Field[]
  /** Register the home-page global with the page-builder blocks. Default: true */
  enableHomePage?: boolean
}

export function cmsModule(options?: CmsModuleOptions): DemiModule {
  const enableHomePage = options?.enableHomePage ?? true

  return createModule({
    slug: 'cms',
    name: 'CMS',
    version: '0.1.0',
    dependencies: { media: '^0.1.0' },
    collections: [
      createPagesCollection({
        enableSeo: options?.enableSeo ?? true,
        enableNavPlacement: options?.enableNavPlacement ?? true,
        extraFields: options?.extraFields,
      }),
    ],
    globals: enableHomePage ? [HomePageGlobal] : [],
  })
}

export {
  HOME_PAGE_BLOCKS,
  HeroBlock,
  TrustBarBlock,
  FeaturedProductsBlock,
  CategoryTilesBlock,
  RichTextBlock,
} from './blocks/index.ts'

export type {
  HomeBlockData,
  HeroBlockData,
  TrustBarBlockData,
  FeaturedProductsBlockData,
  CategoryTilesBlockData,
  RichTextBlockData,
} from './blocks/index.ts'

export { HomePageGlobal } from './globals/HomePage.ts'
