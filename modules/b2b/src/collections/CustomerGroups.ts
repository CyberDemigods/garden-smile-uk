import type { CollectionConfig } from 'payload'

export const CustomerGroupsCollection: CollectionConfig = {
  slug: 'customer-groups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'discountPercent', 'netPricing', 'defaultTaxExempt', 'isDefault'],
    description:
      'Customer segments with their own pricing and tax rules (Retail, Wholesale, VIP, etc.).',
    group: 'B2B',
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
    update: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
    delete: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: { description: 'Stable identifier (e.g. "wholesale", "vip"). Used by helpers and config.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
      admin: { description: 'Internal note — not shown publicly.' },
    },
    {
      name: 'discountPercent',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Discount (%)',
      admin: { step: 0.5, description: 'Applied to base product price for users in this group.' },
    },
    {
      name: 'netPricing',
      type: 'checkbox',
      defaultValue: false,
      label: 'Display prices net of VAT',
      admin: {
        description:
          'When on, the storefront should show prices excluding VAT for users in this group (typical for B2B).',
      },
    },
    {
      name: 'defaultTaxExempt',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default tax-exempt',
      admin: {
        description:
          'When on, users in this group default to tax-exempt (e.g. intra-EU reverse charge). Per-user override still wins.',
      },
    },
    {
      name: 'requireVatNumber',
      type: 'checkbox',
      defaultValue: false,
      label: 'Require VAT number',
      admin: {
        description:
          'When on, registration / checkout flows for this group must collect a valid VAT number. Storefront enforces this.',
      },
    },
    {
      name: 'paymentTermsDays',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: 'Payment terms (days)',
      admin: {
        description: '0 = pay on order. 14, 30, 60 = NET-X credit terms (admins enforce manually for now).',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default group',
      admin: {
        position: 'sidebar',
        description: 'Assigned to new users automatically. Only one group should have this on.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display order',
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
