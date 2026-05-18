import type { CollectionConfig } from 'payload'

export const FaqCategoriesCollection: CollectionConfig = {
  slug: 'faq-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    description: 'FAQ categories — groups for FAQ items.',
    group: 'FAQ',
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
      admin: {
        description: 'URL-safe identifier (e.g. "shipping", "returns").',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
      admin: {
        description: 'Short description shown above the category accordion.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
