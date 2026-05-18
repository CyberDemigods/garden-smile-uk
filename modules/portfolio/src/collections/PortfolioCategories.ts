import type { CollectionConfig, FieldHook } from 'payload'

const autoSlugHook: FieldHook = ({ value, data }) => {
  if (!value && data?.name) {
    return (data.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return value
}

export const PortfolioCategories: CollectionConfig = {
  slug: 'portfolio-categories',
  labels: {
    singular: 'Portfolio Category',
    plural: 'Portfolio Categories',
  },
  admin: {
    useAsTitle: 'name',
    description: 'Categories for portfolio works',
    defaultColumns: ['name', 'parent', 'order', 'updatedAt'],
  },
  access: {
    read: () => true,
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
      label: 'Slug (URL)',
      required: true,
      unique: true,
      localized: true,
      hooks: {
        beforeValidate: [autoSlugHook],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Category image',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'portfolio-categories',
      label: 'Parent category',
      admin: {
        description: 'Leave empty for top-level category',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Sort order',
      defaultValue: 0,
    },
  ],
}
