import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { generateOrderNumberHook } from '../hooks/generate-order-number.ts'

export interface OrdersCollectionOptions {
  /** afterChange hooks to run on order events */
  afterChangeHooks?: CollectionAfterChangeHook[]
  /** Shipping provider options for the order's shipping tab. Omit to hide the field. */
  shippingProviders?: Array<{ label: string; value: string }>
  /** Show "Collection point" field in the shipping tab. Default: false */
  enableCollectPoints?: boolean
  /** Default country pre-filled in the shipping address. Default: 'Poland' */
  defaultCountry?: string
}

export function createOrdersCollection(options: OrdersCollectionOptions): CollectionConfig {
  return {
    slug: 'orders',
    admin: {
      useAsTitle: 'orderNumber',
      description: 'Track customer orders — payment status, shipping, and fulfilment.',
      defaultColumns: ['orderNumber', 'status', 'shippingMethod', 'customerEmail', 'totalAmount', 'createdAt'],
      group: 'Orders',
      listSearchableFields: ['orderNumber', 'customerEmail', 'customerName'],
    },
    access: {
      read: ({ req }) => !!req.user,
      create: () => true,
      update: ({ req }) => !!req.user,
      delete: ({ req }) => {
        const user = req.user as { role?: string } | undefined
        return user?.role === 'admin'
      },
    },
    fields: [
      {
        name: 'orderNumber',
        type: 'text',
        label: 'Order number',
        required: true,
        unique: true,
        admin: { readOnly: true },
        hooks: {
          beforeValidate: [generateOrderNumberHook],
        },
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        defaultValue: 'pending',
        required: true,
        options: [
          { label: 'Pending payment', value: 'pending' },
          { label: 'Paid', value: 'paid' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      {
        name: 'items',
        type: 'array',
        label: 'Products',
        required: true,
        fields: [
          {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            required: true,
          },
          {
            name: 'productName',
            type: 'text',
            label: 'Product name (snapshot)',
            admin: { readOnly: true },
          },
          {
            name: 'price',
            type: 'number',
            label: 'Price (snapshot)',
            required: true,
          },
          {
            name: 'quantity',
            type: 'number',
            label: 'Quantity',
            defaultValue: 1,
            min: 1,
          },
        ],
      },
      {
        name: 'totalAmount',
        type: 'number',
        label: 'Total amount',
        required: true,
        admin: { readOnly: true, step: 0.01 },
      },
      {
        name: 'shippingCost',
        type: 'number',
        label: 'Shipping cost',
        admin: { readOnly: true, step: 0.01 },
      },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Customer',
            fields: [
              { name: 'customerEmail', type: 'email', label: 'Email', required: true },
              { name: 'customerName', type: 'text', label: 'Full name', required: true },
              { name: 'customerPhone', type: 'text', label: 'Phone' },
            ],
          },
          {
            label: 'Shipping address',
            fields: [
              {
                name: 'shippingAddress',
                type: 'group',
                fields: [
                  { name: 'street', type: 'text', label: 'Street', required: true },
                  { name: 'city', type: 'text', label: 'City', required: true },
                  { name: 'postalCode', type: 'text', label: 'Postal code', required: true },
                  { name: 'county', type: 'text', label: 'County' },
                  { name: 'country', type: 'text', label: 'Country', defaultValue: options.defaultCountry ?? 'Poland' },
                ],
              },
            ],
          },
          {
            label: 'Invoice',
            fields: [
              {
                name: 'wantInvoice',
                type: 'checkbox',
                label: 'Customer wants VAT invoice',
                defaultValue: false,
              },
              {
                name: 'invoiceData',
                type: 'group',
                label: 'Invoice data',
                admin: {
                  condition: (data) => data.wantInvoice as boolean,
                },
                fields: [
                  { name: 'companyName', type: 'text', label: 'Company name' },
                  { name: 'nip', type: 'text', label: 'Tax ID' },
                  {
                    name: 'invoiceAddress',
                    type: 'group',
                    label: 'Company address',
                    fields: [
                      { name: 'street', type: 'text', label: 'Street' },
                      { name: 'city', type: 'text', label: 'City' },
                      { name: 'postalCode', type: 'text', label: 'Postal code' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            label: 'Payment',
            fields: [
              { name: 'paymentId', type: 'text', label: 'Transaction ID', admin: { readOnly: true } },
              { name: 'paymentMethod', type: 'text', label: 'Payment method', admin: { readOnly: true } },
              {
                name: 'paidAt',
                type: 'date',
                label: 'Paid at',
                admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
              },
            ],
          },
          {
            label: 'Shipping',
            fields: [
              { name: 'shippingMethod', type: 'text', label: 'Shipping method', admin: { readOnly: true } },
              ...(options.shippingProviders
                ? [
                    {
                      name: 'shippingProvider' as const,
                      type: 'select' as const,
                      label: 'Shipping provider',
                      admin: { readOnly: true },
                      options: options.shippingProviders,
                    },
                  ]
                : []),
              ...(options.enableCollectPoints
                ? [
                    {
                      name: 'collectPointName' as const,
                      type: 'text' as const,
                      label: 'Collection point',
                      admin: { readOnly: true },
                    },
                  ]
                : []),
              { name: 'trackingNumber', type: 'text', label: 'Tracking number' },
            ],
          },
        ],
      },
      {
        name: 'locale',
        type: 'text',
        label: 'Order locale',
        admin: { readOnly: true },
      },
      {
        name: 'notes',
        type: 'textarea',
        label: 'Internal notes',
      },
    ],
    hooks: {
      afterChange: options.afterChangeHooks ?? [],
    },
  }
}
