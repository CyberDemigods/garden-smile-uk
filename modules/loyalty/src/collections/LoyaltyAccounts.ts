import type { CollectionConfig } from 'payload'

export const LoyaltyAccountsCollection: CollectionConfig = {
  slug: 'loyalty-accounts',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'balance', 'lifetimeEarned', 'tier', 'updatedAt'],
    description:
      'One account per customer. Balance and tier are derived from transactions; do not edit directly except for manual corrections.',
    group: 'Loyalty',
  },
  access: {
    // Customers may read their own account; admins see everything.
    read: ({ req }) => {
      const user = req.user as { id?: unknown; role?: string } | undefined
      if (user?.role === 'admin') return true
      if (!user?.id) return false
      return { user: { equals: user.id } }
    },
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users' as never,
      required: true,
      unique: true,
      index: true,
      label: 'Customer',
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      label: 'Current balance (points)',
      admin: { description: 'Spendable points. Updated atomically by helpers.', readOnly: true },
    },
    {
      name: 'lifetimeEarned',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      label: 'Lifetime earned',
      admin: {
        description: 'Total earned across all time, ignoring redemptions. Drives tier.',
        readOnly: true,
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: 'bronze',
      options: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
      ],
      admin: {
        description: 'Recomputed from lifetimeEarned vs shop-settings thresholds.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      label: 'Joined at',
      admin: {
        date: { displayFormat: 'yyyy-MM-dd' },
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal notes',
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
