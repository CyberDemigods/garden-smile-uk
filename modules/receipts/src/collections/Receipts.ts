import type { CollectionConfig } from 'payload'

export const ReceiptsCollection: CollectionConfig = {
  slug: 'receipts',
  admin: {
    useAsTitle: 'documentNumber',
    defaultColumns: ['documentNumber', 'documentType', 'order', 'totalAmount', 'createdAt'],
    description:
      'Auto-generated receipts/invoices linked to paid orders. The PDF is regenerated whenever the order is repaid (rare).',
    group: 'Receipts',
  },
  access: {
    // Customers cannot read directly; expose via signed URL helper if needed.
    read: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
    // Admins may manually create for backfill; hooks normally handle it.
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
      name: 'documentNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Document number',
      admin: { description: 'Sequential number — e.g. P/2026/0001 (paragon) or FV/2026/0001 (invoice).' },
    },
    {
      name: 'documentType',
      type: 'select',
      required: true,
      defaultValue: 'pl-paragon',
      options: [
        { label: 'PL Paragon (działalność nierejestrowana)', value: 'pl-paragon' },
        { label: 'PL Faktura VAT', value: 'pl-invoice-vat' },
        { label: 'PL Faktura uproszczona', value: 'pl-simplified-invoice' },
        { label: 'UK Invoice', value: 'uk-invoice' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders' as never,
      required: true,
      unique: true,
      index: true,
      label: 'Order',
      admin: { description: 'One receipt per order. Re-issue requires deleting the existing one first.' },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media' as never,
      required: false,
      label: 'PDF file',
      admin: { description: 'Generated PDF stored in media collection.' },
    },
    {
      name: 'issuedAt',
      type: 'date',
      required: true,
      label: 'Issued at',
      admin: { date: { displayFormat: 'yyyy-MM-dd HH:mm' } },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      label: 'Total amount',
      admin: { step: 0.01, readOnly: true },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      label: 'Currency',
      admin: { readOnly: true },
    },
    {
      name: 'sellerSnapshot',
      type: 'json',
      label: 'Seller snapshot',
      admin: {
        description:
          'Frozen copy of seller details from shop-settings at the time of issue. Preserves the document if shop info changes later.',
        readOnly: true,
      },
    },
    {
      name: 'buyerSnapshot',
      type: 'json',
      label: 'Buyer snapshot',
      admin: { description: 'Frozen buyer details from the order.', readOnly: true },
    },
    {
      name: 'lineItems',
      type: 'json',
      label: 'Line items',
      admin: { description: 'Frozen list of items for the document.', readOnly: true },
    },
  ],
  timestamps: true,
}
