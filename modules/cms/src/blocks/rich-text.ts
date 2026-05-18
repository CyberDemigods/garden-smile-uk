import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'rich-text',
  labels: { singular: 'Rich text', plural: 'Rich text blocks' },
  fields: [
    {
      name: 'maxWidth',
      type: 'select',
      label: 'Max width',
      defaultValue: 'prose',
      options: [
        { label: 'Prose (narrow, readable)', value: 'prose' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full', value: 'full' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      localized: true,
    },
  ],
}
