import type { CollectionConfig } from 'payload'

export const SubscriptionPlansCollection: CollectionConfig = {
  slug: 'subscription-plans',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'currency', 'interval', 'isActive'],
    description:
      'Subscription offers customers can sign up for. For Stripe-backed billing, paste the matching Price ID from your Stripe Dashboard.',
    group: 'Subscriptions',
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
      label: 'Plan name',
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: { description: 'URL-safe identifier (e.g. "pro-monthly").' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Price',
      admin: { step: 0.01, description: 'Price per billing interval, before tax.' },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'GBP',
      label: 'Currency',
      admin: { description: 'ISO 4217 code (GBP, EUR, USD, PLN).' },
    },
    {
      name: 'interval',
      type: 'select',
      required: true,
      defaultValue: 'month',
      options: [
        { label: 'Daily', value: 'day' },
        { label: 'Weekly', value: 'week' },
        { label: 'Monthly', value: 'month' },
        { label: 'Yearly', value: 'year' },
      ],
    },
    {
      name: 'intervalCount',
      type: 'number',
      defaultValue: 1,
      min: 1,
      label: 'Interval count',
      admin: { description: 'e.g. interval=month + count=3 means billed every 3 months.' },
    },
    {
      name: 'trialDays',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: 'Trial period (days)',
      admin: { description: '0 = no trial. Honoured by Stripe Checkout when set on the matching Price.' },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
      admin: { description: 'Bullet points shown on the pricing page.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: { position: 'sidebar', description: 'Inactive plans are hidden from public sign-up.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display order',
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripeProductId',
      type: 'text',
      label: 'Stripe Product ID',
      admin: {
        position: 'sidebar',
        description: 'prod_... from your Stripe Dashboard (optional if using a different provider).',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      label: 'Stripe Price ID',
      admin: {
        position: 'sidebar',
        description: 'price_... from your Stripe Dashboard. Required for Stripe Checkout flow.',
      },
    },
  ],
  timestamps: true,
}
