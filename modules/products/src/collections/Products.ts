import type { CollectionConfig, Field } from 'payload'
import { autoSlugHook } from '../hooks/auto-slug.ts'
import { priceHistoryHook } from '../hooks/price-history.ts'

export interface ProductsCollectionOptions {
  enablePriceHistory: boolean
  enableDimensions: boolean
  /** Extra fields appended to the products collection */
  extraFields?: Field[]
}

export function createProductsCollection(options: ProductsCollectionOptions): CollectionConfig {
  const fields: Field[] = [
    {
      name: 'name',
      type: 'text',
      label: 'Product name',
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
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      label: 'Price',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
  ]

  // Omnibus directive fields
  if (options.enablePriceHistory) {
    fields.push(
      {
        name: 'lowestPrice30d',
        type: 'number',
        label: 'Lowest price in 30 days',
        admin: {
          readOnly: true,
          position: 'sidebar',
          description: 'Auto-calculated from price history (Omnibus directive)',
          step: 0.01,
        },
      },
      {
        name: 'priceHistory',
        type: 'array',
        label: 'Price history',
        admin: {
          readOnly: true,
          condition: (data) => (data?.priceHistory as unknown[])?.length > 0,
        },
        fields: [
          {
            name: 'price',
            type: 'number',
            label: 'Price',
            admin: { step: 0.01 },
          },
          {
            name: 'changedAt',
            type: 'date',
            label: 'Changed at',
            admin: {
              date: { pickerAppearance: 'dayAndTime' },
            },
          },
        ],
      },
    )
  }

  fields.push(
    {
      name: 'images',
      type: 'array',
      label: 'Images',
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
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category',
      hasMany: false,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'available',
      required: true,
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Hidden', value: 'hidden' },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      label: 'Stock quantity',
      defaultValue: 1,
      min: 0,
    },
  )

  // Dimensions group
  if (options.enableDimensions) {
    fields.push({
      name: 'dimensions',
      type: 'group',
      label: 'Dimensions',
      fields: [
        { name: 'width', type: 'number', label: 'Width (cm)' },
        { name: 'height', type: 'number', label: 'Height (cm)' },
        { name: 'depth', type: 'number', label: 'Depth (cm)' },
      ],
    })
  }

  // Extra fields from module options
  if (options.extraFields) {
    fields.push(...options.extraFields)
  }

  const hooks: CollectionConfig['hooks'] = {}

  if (options.enablePriceHistory) {
    hooks.beforeChange = [priceHistoryHook]
  }

  return {
    slug: 'products',
    admin: {
      useAsTitle: 'name',
      description: 'Products',
      defaultColumns: ['name', 'status', 'price', 'category', 'updatedAt'],
    },
    access: {
      read: () => true,
    },
    fields,
    hooks,
  }
}
