import type { CollectionConfig } from 'payload'

export const FaqItemsCollection: CollectionConfig = {
  slug: 'faq-items',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'featured', 'order'],
    description: 'Frequently asked questions and answers.',
    group: 'FAQ',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'richText',
      label: 'Answer',
      required: true,
      localized: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'faq-categories',
      label: 'Category',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within their category.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured items appear at the top of the FAQ page.',
      },
    },
  ],
}
