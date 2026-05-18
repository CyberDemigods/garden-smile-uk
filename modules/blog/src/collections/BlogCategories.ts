import type { CollectionConfig } from 'payload'

export const BlogCategoriesCollection: CollectionConfig = {
  slug: 'blog-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    description: 'Blog categories — top-level grouping for posts.',
    group: 'Blog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Category name',
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
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover image',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display order',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
