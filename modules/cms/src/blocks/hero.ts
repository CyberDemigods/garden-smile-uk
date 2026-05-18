import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero blocks' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow (small label above heading)',
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      required: true,
      localized: true,
    },
    {
      name: 'headingAccent',
      type: 'text',
      label: 'Heading accent (italic part appended after heading)',
      localized: true,
      admin: { description: 'Optional italic line under the main heading.' },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media' as never,
      label: 'Hero image (optional)',
    },
    {
      name: 'primaryCta',
      type: 'group',
      label: 'Primary CTA',
      fields: [
        { name: 'label', type: 'text', localized: true, required: false },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      label: 'Secondary CTA (optional)',
      fields: [
        { name: 'label', type: 'text', localized: true, required: false },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}
