import type { CollectionConfig } from 'payload'

export const SubscriptionsCollection: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'stripeSubscriptionId',
    defaultColumns: ['user', 'plan', 'status', 'currentPeriodEnd', 'updatedAt'],
    description:
      'Per-customer subscription state. Lifecycle is driven by the billing provider (Stripe webhooks); fields here are a synced cache.',
    group: 'Subscriptions',
  },
  access: {
    read: ({ req }) => {
      const user = req.user as { id?: unknown; role?: string } | undefined
      if (user?.role === 'admin') return true
      if (!user?.id) return false
      return { user: { equals: user.id } }
    },
    // Subscriptions are created server-side from checkout webhooks; admins may manually create for backfill.
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
      index: true,
      label: 'Subscriber',
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'subscription-plans' as never,
      required: true,
      label: 'Plan',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'incomplete',
      options: [
        { label: 'Incomplete (awaiting first payment)', value: 'incomplete' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Active', value: 'active' },
        { label: 'Past due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Paused', value: 'paused' },
        { label: 'Unpaid', value: 'unpaid' },
      ],
      admin: { position: 'sidebar', description: 'Synced from billing provider events.' },
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
      label: 'Current period start',
      admin: { date: { displayFormat: 'yyyy-MM-dd' }, readOnly: true },
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      label: 'Current period end',
      admin: { date: { displayFormat: 'yyyy-MM-dd' }, readOnly: true },
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
      label: 'Cancel at period end',
      admin: { description: 'Customer requested cancellation but service continues until currentPeriodEnd.' },
    },
    {
      name: 'canceledAt',
      type: 'date',
      label: 'Canceled at',
      admin: { date: { displayFormat: 'yyyy-MM-dd' }, readOnly: true },
    },
    {
      name: 'lastInvoiceStatus',
      type: 'select',
      label: 'Last invoice status',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Open', value: 'open' },
        { label: 'Past due', value: 'past_due' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'lastInvoiceAt',
      type: 'date',
      label: 'Last invoice at',
      admin: { date: { displayFormat: 'yyyy-MM-dd HH:mm' }, readOnly: true },
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'stripe',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Manual (admin-managed)', value: 'manual' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      label: 'Stripe subscription ID',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'sub_... — primary key linking back to Stripe.' },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      label: 'Stripe customer ID',
      index: true,
      admin: { position: 'sidebar', description: 'cus_... — used to open the Customer Portal.' },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Provider metadata',
      admin: {
        readOnly: true,
        description: 'Raw snapshot fields the sync helper preserves for diagnostics.',
      },
    },
  ],
  timestamps: true,
}
