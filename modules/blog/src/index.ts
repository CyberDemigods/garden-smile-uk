import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { BlogPostsCollection } from './collections/BlogPosts.ts'
import { BlogCategoriesCollection } from './collections/BlogCategories.ts'
import { BlogTagsCollection } from './collections/BlogTags.ts'
import { BlogAuthorsCollection } from './collections/BlogAuthors.ts'

export interface BlogModuleOptions {
  /** Reserved for future options (e.g. comments, RSS feed). */
  _placeholder?: never
}

export function blogModule(_options?: BlogModuleOptions): DemiModule {
  return createModule({
    slug: 'blog',
    name: 'Blog',
    version: '0.1.0',
    dependencies: { media: '^0.1.0' },
    collections: [
      BlogCategoriesCollection,
      BlogTagsCollection,
      BlogAuthorsCollection,
      BlogPostsCollection,
    ],
  })
}

export {
  BlogPostsCollection,
  BlogCategoriesCollection,
  BlogTagsCollection,
  BlogAuthorsCollection,
}
