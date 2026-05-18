import type { CollectionConfig, Field, FieldHook } from 'payload'

const autoSlugHook: FieldHook = ({ value, data }) => {
  if (!value && data?.title) {
    return (data.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return value
}

export interface PortfolioWorksOptions {
  /** Link works to products (requires products module). Default: false */
  linkToProducts?: boolean
  /** Extra fields to append */
  extraFields?: Field[]
}

export function createPortfolioWorksCollection(options: PortfolioWorksOptions): CollectionConfig {
  const fields: Field[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
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
      type: 'richText',
      label: 'Description',
      required: true,
      localized: true,
    },
    {
      name: 'images',
      type: 'array',
      label: 'Image gallery',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: {
        description: 'Optimized thumbnail for grid display',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'portfolio-categories',
      label: 'Category',
      required: true,
    },
    {
      name: 'technique',
      type: 'text',
      label: 'Technique',
      localized: true,
    },
    {
      name: 'year',
      type: 'number',
      label: 'Year',
    },
  ]

  if (options.linkToProducts) {
    fields.push({
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Linked product',
      admin: {
        description: 'Optional: link to a product in the shop if this work is for sale',
      },
    })
  }

  fields.push({
    name: 'order',
    type: 'number',
    label: 'Sort order',
    defaultValue: 0,
  })

  if (options.extraFields) {
    fields.push(...options.extraFields)
  }

  return {
    slug: 'portfolio-works',
    labels: {
      singular: 'Portfolio Work',
      plural: 'Portfolio Works',
    },
    admin: {
      useAsTitle: 'title',
      description: 'Works displayed in the portfolio',
      defaultColumns: ['title', 'category', 'technique', 'year', 'order', 'updatedAt'],
    },
    access: {
      read: () => true,
    },
    fields,
  }
}
