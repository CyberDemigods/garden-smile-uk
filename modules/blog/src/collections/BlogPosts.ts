import type { CollectionConfig } from 'payload'

export const BlogPostsCollection: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt', 'author'],
    description: 'Blog posts. Drafts hidden from the storefront until status = published.',
    group: 'Blog',
  },
  defaultSort: '-publishedAt',
  fields: [
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
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'URL-safe identifier. Same across languages.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      localized: true,
      admin: {
        description: 'Short summary shown on cards and used as meta description fallback. Aim for 120–160 chars.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover image',
      admin: {
        description: 'Hero image at the top of the post and as the card thumbnail.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      localized: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'blog-authors',
      label: 'Author',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'blog-categories',
      label: 'Category',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'blog-tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published at',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'yyyy-MM-dd HH:mm' },
        description: 'Publication date. Auto-set on first publish if empty.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?.status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Meta title', localized: true },
        { name: 'metaDescription', type: 'textarea', label: 'Meta description', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'OG image' },
      ],
    },
  ],
  timestamps: true,
}
