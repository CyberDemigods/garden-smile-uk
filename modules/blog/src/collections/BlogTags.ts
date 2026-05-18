import type { CollectionConfig } from 'payload'

export const BlogTagsCollection: CollectionConfig = {
  slug: 'blog-tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Blog tags — lightweight cross-cutting labels.',
    group: 'Blog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tag',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
    },
  ],
}
