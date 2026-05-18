import type { Block } from 'payload'

export const CategoryTilesBlock: Block = {
  slug: 'category-tiles',
  labels: { singular: 'Category tiles', plural: 'Category tile blocks' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories' as never,
      hasMany: true,
      maxRows: 8,
      required: true,
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Columns (desktop)',
      defaultValue: '4',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
  ],
}
