import type { Block } from 'payload'

export const FeaturedProductsBlock: Block = {
  slug: 'featured-products',
  labels: { singular: 'Featured products', plural: 'Featured products blocks' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: { description: 'e.g. "Bestsellers" or "New in"' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products' as never,
      hasMany: true,
      maxRows: 8,
      required: true,
      admin: { description: 'Pick the products to feature, ordered as you want them displayed.' },
    },
    {
      name: 'viewAllHref',
      type: 'text',
      label: 'View-all link (optional)',
      defaultValue: '/shop',
    },
  ],
}
