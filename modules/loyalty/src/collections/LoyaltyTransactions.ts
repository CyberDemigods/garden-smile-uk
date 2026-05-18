import type { CollectionConfig } from 'payload'

export const LoyaltyTransactionsCollection: CollectionConfig = {
  slug: 'loyalty-transactions',
  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['account', 'type', 'amount', 'reason', 'relatedOrder', 'createdAt'],
    description:
      'Append-only ledger. Earn = positive, redeem/expire = negative. Adjustments may be either sign.',
    group: 'Loyalty',
  },
  access: {
    read: ({ req }) => {
      const user = req.user as { id?: unknown; role?: string } | undefined
      if (user?.role === 'admin') return true
      // Customers cannot directly read transactions; expose via account-scoped helper.
      return false
    },
    create: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
    update: () => false,
    delete: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'loyalty-accounts' as never,
      required: true,
      index: true,
      label: 'Account',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Earn', value: 'earn' },
        { label: 'Redeem', value: 'redeem' },
        { label: 'Adjust (admin)', value: 'adjust' },
        { label: 'Expire', value: 'expire' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Amount (signed)',
      admin: {
        description: 'Positive for earn/positive-adjust. Negative for redeem/expire/negative-adjust.',
      },
    },
    {
      name: 'reason',
      type: 'text',
      required: true,
      label: 'Reason',
      maxLength: 200,
    },
    {
      name: 'relatedOrder',
      type: 'relationship',
      relationTo: 'orders' as never,
      label: 'Related order',
      admin: {
        description:
          'For earn-on-purchase transactions. Used to enforce one earn-per-order idempotency.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Expires at',
      admin: {
        date: { displayFormat: 'yyyy-MM-dd' },
        description: 'When set on an earn transaction, points expire on this date.',
      },
    },
  ],
  timestamps: true,
}
