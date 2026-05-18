import type { CollectionConfig, Field } from 'payload'

export interface PagesCollectionOptions {
  /** Enable SEO fields (meta title, meta description). Default: true */
  enableSeo?: boolean
  /** Enable navigation placement fields. Default: true */
  enableNavPlacement?: boolean
  /** Extra fields to append to the Pages collection */
  extraFields?: Field[]
}

export function createPagesCollection(options: PagesCollectionOptions): CollectionConfig {
  const fields: Field[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Page title',
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
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      localized: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured image',
    },
  ]

  if (options.enableNavPlacement) {
    fields.push(
      {
        name: 'showInNav',
        type: 'select',
        label: 'Show in navigation',
        defaultValue: 'hidden',
        options: [
          { label: 'Hidden', value: 'hidden' },
          { label: 'Footer', value: 'footer' },
          { label: 'Header', value: 'header' },
          { label: 'Header & Footer', value: 'both' },
        ],
        admin: {
          position: 'sidebar',
        },
      },
      {
        name: 'navOrder',
        type: 'number',
        label: 'Navigation order',
        defaultValue: 0,
        admin: {
          description: 'Lower number = higher in the list',
          position: 'sidebar',
        },
      },
    )
  }

  if (options.enableSeo) {
    fields.push({
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta title',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta description',
          localized: true,
        },
      ],
    })
  }

  if (options.extraFields) {
    fields.push(...options.extraFields)
  }

  return {
    slug: 'pages',
    admin: {
      useAsTitle: 'title',
      description: 'Static pages (About, Terms, etc.)',
    },
    access: {
      read: () => true,
    },
    fields,
  }
}
