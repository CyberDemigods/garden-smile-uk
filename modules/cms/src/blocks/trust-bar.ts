import type { Block } from 'payload'

export const TrustBarBlock: Block = {
  slug: 'trust-bar',
  labels: { singular: 'Trust bar', plural: 'Trust bars' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji or short identifier)',
          admin: { description: 'Emoji works directly. For named icons, the storefront maps short names like "shield", "truck", "leaf".' },
          defaultValue: '✓',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
  ],
}
