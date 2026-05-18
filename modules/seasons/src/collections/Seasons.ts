import type { CollectionConfig } from 'payload'

export const SeasonsCollection: CollectionConfig = {
  slug: 'seasons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'startDate', 'endDate', 'isAlwaysActive'],
    description: 'Seasonal collections (Halloween, Christmas, Easter, etc.). Auto-publish/unpublish based on date range.',
    group: 'Catalog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Season name',
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
        description: 'URL-safe identifier (e.g. "halloween", "christmas-2026"). Same across languages.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      localized: true,
      admin: { description: 'Short subtitle shown on the season page hero.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero image',
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start date',
      admin: {
        date: { displayFormat: 'yyyy-MM-dd' },
        description: 'When the season becomes active. Leave empty if season is always available.',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End date',
      admin: {
        date: { displayFormat: 'yyyy-MM-dd' },
        description: 'When the season ends. Leave empty if season is always available.',
      },
    },
    {
      name: 'isAlwaysActive',
      type: 'checkbox',
      label: 'Always active',
      defaultValue: false,
      admin: {
        description: 'When checked, ignores start/end dates and shows the season permanently.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display order',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'themes',
      label: 'Theme',
      admin: {
        position: 'sidebar',
        description: 'Visual theme to apply when this season is active. Falls back to default theme if empty.',
      },
    },
  ],
}
