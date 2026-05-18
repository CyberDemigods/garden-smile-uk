import type { CollectionConfig } from 'payload'

export const BlogAuthorsCollection: CollectionConfig = {
  slug: 'blog-authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'email'],
    description: 'Blog authors — bylines for posts. Separate from system users so non-admins can be credited.',
    group: 'Blog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Display name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'URL-safe (e.g. "anna-kowalska"). Used at /blog/author/[slug].',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Short bio',
      localized: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email (optional)',
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social links',
      fields: [
        { name: 'website', type: 'text', label: 'Website' },
        { name: 'twitter', type: 'text', label: 'X / Twitter' },
        { name: 'instagram', type: 'text', label: 'Instagram' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
      ],
    },
  ],
}
