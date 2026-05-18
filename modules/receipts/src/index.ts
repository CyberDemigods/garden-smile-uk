import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { CollectionAfterChangeHook } from 'payload'
import { ReceiptsCollection } from './collections/Receipts.ts'
import { generateReceiptForOrder } from './helpers.ts'
import type { ReceiptTemplateId } from './templates/types.ts'

export interface ReceiptsModuleOptions {
  /** Adds a Receipts tab to shop-settings. Default: true. */
  extendShopSettings?: boolean
  /** Default template used when shop-settings does not override. Default: 'pl-paragon'. */
  defaultTemplate?: ReceiptTemplateId
  /** Auto-generate when order transitions to paid. Default: true. */
  autoGenerateOnPaid?: boolean
}

function makeAfterOrderChange(opts: ReceiptsModuleOptions): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return doc

    const prevStatus = (previousDoc as { status?: string } | undefined)?.status
    const currStatus = (doc as { status?: string }).status
    if (prevStatus === currStatus) return doc
    if (currStatus !== 'paid') return doc

    let enabled = opts.autoGenerateOnPaid ?? true
    try {
      const settings = (await req.payload.findGlobal({
        slug: 'shop-settings' as never,
        depth: 0,
      })) as { receiptsAutoGenerate?: boolean }
      if (typeof settings.receiptsAutoGenerate === 'boolean') {
        enabled = settings.receiptsAutoGenerate
      }
    } catch {
      // shop-settings unavailable — fall back to module option.
    }
    if (!enabled) return doc

    try {
      await generateReceiptForOrder(req.payload, (doc as { id: string | number }).id)
    } catch (err) {
      // Never block the order update — log and move on. Admin can manually re-issue.
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[receipts] failed to generate receipt for order: ${msg}`)
    }
    return doc
  }
}

export function receiptsModule(options: ReceiptsModuleOptions = {}): DemiModule {
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'receipts',
    name: 'Receipts',
    version: '0.1.0',
    dependencies: { orders: '^0.1.0', media: '^0.1.0' },
    collections: [ReceiptsCollection],
    extendCollections: {
      orders: {
        hooks: {
          afterChange: [makeAfterOrderChange(options)],
        },
      },
    },
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'Receipts',
                    fields: [
                      {
                        name: 'receiptsAutoGenerate',
                        type: 'checkbox',
                        label: 'Auto-generate on paid order',
                        defaultValue: true,
                      },
                      {
                        name: 'receiptsTemplateId',
                        type: 'select',
                        label: 'Document template',
                        defaultValue: options.defaultTemplate ?? 'pl-paragon',
                        options: [
                          { label: 'PL Paragon (działalność nierejestrowana)', value: 'pl-paragon' },
                          { label: 'PL Faktura VAT', value: 'pl-invoice-vat' },
                          { label: 'PL Faktura uproszczona', value: 'pl-simplified-invoice' },
                          { label: 'UK Invoice', value: 'uk-invoice' },
                        ],
                      },
                      {
                        name: 'receiptsSeller',
                        type: 'group',
                        label: 'Seller details (printed on every document)',
                        fields: [
                          { name: 'name', type: 'text', label: 'Legal name', required: false },
                          {
                            name: 'address',
                            type: 'textarea',
                            label: 'Address',
                            admin: { description: 'Multi-line allowed.' },
                          },
                          { name: 'taxId', type: 'text', label: 'Tax / VAT ID' },
                          { name: 'email', type: 'email', label: 'Email' },
                          { name: 'phone', type: 'text', label: 'Phone' },
                          { name: 'bankAccount', type: 'text', label: 'Bank account' },
                          {
                            name: 'legalNote',
                            type: 'textarea',
                            label: 'Legal note',
                            admin: {
                              description:
                                'Footer text — e.g. "Sprzedaż w ramach działalności nierejestrowanej, art. 5 ust. 1 ustawy z dnia 6 marca 2018 r." or "VAT exempt under threshold".',
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
      : undefined,
  })
}

export { ReceiptsCollection } from './collections/Receipts.ts'
export {
  generateReceiptForOrder,
  getReceiptByOrder,
  buildReceiptData,
  nextDocumentNumber,
} from './helpers.ts'
export { renderReceipt } from './renderer/pdf.ts'
export type {
  ReceiptData,
  ReceiptLineItem,
  ReceiptTemplateId,
  ReceiptTotals,
  SellerInfo,
  BuyerInfo,
} from './templates/types.ts'
