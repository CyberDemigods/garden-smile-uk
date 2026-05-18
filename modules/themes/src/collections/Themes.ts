import type { CollectionConfig } from 'payload'

export const ThemesCollection: CollectionConfig = {
  slug: 'themes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'decoration', 'isBuiltIn'],
    description:
      'Visual themes — colour palette + decorative effect. Built-in themes are seeded automatically; custom themes can be added by the shop owner.',
    group: 'Appearance',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Theme name',
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
        description:
          'Unique key (e.g. "halloween", "christmas-2026"). Built-in themes use reserved slugs: default, christmas, halloween, easter, valentines, summer.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
    {
      name: 'accent',
      type: 'text',
      label: 'Accent colour (RGB triplet)',
      required: true,
      admin: {
        description: 'Space-separated RGB, e.g. "234 88 12" for orange-600.',
      },
    },
    {
      name: 'accentForeground',
      type: 'text',
      label: 'Accent foreground (RGB)',
      defaultValue: '255 255 255',
    },
    {
      name: 'accentDark',
      type: 'text',
      label: 'Accent (dark mode) (RGB)',
      admin: {
        description: 'Lighter variant used on dark backgrounds.',
      },
    },
    {
      name: 'heroGradientFrom',
      type: 'text',
      label: 'Hero gradient — from (RGB)',
      admin: { description: 'Leave empty to use default hero background.' },
    },
    {
      name: 'heroGradientVia',
      type: 'text',
      label: 'Hero gradient — via (RGB, optional)',
    },
    {
      name: 'heroGradientTo',
      type: 'text',
      label: 'Hero gradient — to (RGB)',
    },
    {
      name: 'decoration',
      type: 'select',
      label: 'Decorative effect',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Snowflakes', value: 'snowflakes' },
        { label: 'Spiders', value: 'spiders' },
        { label: 'Eggs', value: 'eggs' },
        { label: 'Hearts', value: 'hearts' },
        { label: 'Leaves', value: 'leaves' },
        { label: 'Sparkles', value: 'sparkles' },
      ],
    },
    {
      name: 'isBuiltIn',
      type: 'checkbox',
      label: 'Built-in',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Marks themes seeded by the platform. Built-in themes can be edited (palette tweaks) but should not be deleted.',
      },
    },
  ],
}
