import type { Payload, PayloadRequest } from 'payload'
import type { ReceiptData, ReceiptTemplateId, SellerInfo } from './templates/types.ts'
import { renderReceipt } from './renderer/pdf.ts'

type PayloadLike = Payload | PayloadRequest['payload']

/**
 * Format a sequential document number for the given year.
 * Pattern: <PREFIX>/<YEAR>/<padded sequence>, e.g. P/2026/0042.
 */
export async function nextDocumentNumber(
  payload: PayloadLike,
  templateId: ReceiptTemplateId,
): Promise<string> {
  const prefix = templateId === 'pl-paragon' ? 'P' : 'FV'
  const year = new Date().getFullYear()

  const yearStart = new Date(`${year}-01-01T00:00:00Z`).toISOString()
  const result = await payload.find({
    collection: 'receipts' as never,
    where: {
      and: [
        { documentType: { equals: templateId } },
        { issuedAt: { greater_than_equal: yearStart } },
      ],
    } as never,
    limit: 0,
    depth: 0,
    pagination: false,
  })

  const sequence = String(result.totalDocs + 1).padStart(4, '0')
  return `${prefix}/${year}/${sequence}`
}

interface OrderShape {
  id: string | number
  orderNumber?: string
  totalAmount?: number
  shippingCost?: number
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  paidAt?: string
  paymentMethod?: string
  shippingAddress?: {
    street?: string
    city?: string
    postalCode?: string
    county?: string
    country?: string
  } | null
  items?: Array<{
    productName?: string
    price?: number
    quantity?: number
  }>
  invoiceData?: {
    companyName?: string
    nip?: string
    invoiceAddress?: { street?: string; city?: string; postalCode?: string }
  } | null
  wantInvoice?: boolean
}

interface ShopSettingsShape {
  shopName?: string
  defaultCurrency?: string
  receiptsTemplateId?: ReceiptTemplateId
  receiptsSeller?: SellerInfo
  receiptsLegalNote?: string
  vatRate?: number
  pricesIncludeVat?: boolean
}

/**
 * Build the language-agnostic ReceiptData payload from a paid order +
 * shop-settings snapshot. Caller decides which template renders this.
 */
export function buildReceiptData(
  order: OrderShape,
  settings: ShopSettingsShape,
  documentNumber: string,
): ReceiptData {
  const currency = settings.defaultCurrency ?? 'GBP'
  const issuedAt = new Date().toISOString()

  const items = (order.items ?? []).map((it) => {
    const unitPrice = Number(it.price ?? 0)
    const quantity = Number(it.quantity ?? 1)
    return {
      name: it.productName ?? '—',
      quantity,
      unitPrice,
      lineTotal: Math.round(unitPrice * quantity * 100) / 100,
      vatRate: settings.vatRate && settings.pricesIncludeVat ? settings.vatRate : undefined,
    }
  })

  const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0)
  const shippingCost = Number(order.shippingCost ?? 0)
  const grandTotal = Number(order.totalAmount ?? subtotal + shippingCost)
  // For pricesIncludeVat=true: VAT is contained inside grandTotal — extract it.
  const vatAmount =
    settings.vatRate && settings.pricesIncludeVat
      ? Math.round((grandTotal - grandTotal / (1 + settings.vatRate / 100)) * 100) / 100
      : 0

  const seller: SellerInfo = {
    name: settings.receiptsSeller?.name || settings.shopName || 'Seller',
    address: settings.receiptsSeller?.address || '',
    taxId: settings.receiptsSeller?.taxId,
    email: settings.receiptsSeller?.email,
    phone: settings.receiptsSeller?.phone,
    bankAccount: settings.receiptsSeller?.bankAccount,
    legalNote: settings.receiptsSeller?.legalNote || settings.receiptsLegalNote,
  }

  const addressParts = [
    order.shippingAddress?.street,
    [order.shippingAddress?.postalCode, order.shippingAddress?.city].filter(Boolean).join(' '),
    order.shippingAddress?.county,
    order.shippingAddress?.country,
  ].filter(Boolean)

  return {
    documentNumber,
    issuedAt,
    paidAt: order.paidAt,
    currency,
    seller,
    buyer: {
      name: order.customerName ?? '—',
      email: order.customerEmail ?? '',
      address: addressParts.join('\n'),
      companyName: order.wantInvoice ? order.invoiceData?.companyName : undefined,
      taxId: order.wantInvoice ? order.invoiceData?.nip : undefined,
    },
    items,
    totals: {
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      vatAmount,
      grandTotal,
    },
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
  }
}

/**
 * Generate (or fetch existing) receipt for an order. Idempotent — returns the
 * existing receipt doc when one already exists for the order.
 */
export async function generateReceiptForOrder(
  payload: PayloadLike,
  orderId: string | number,
): Promise<{ receiptId: string | number; documentNumber: string; created: boolean }> {
  // Idempotency check.
  const existing = await payload.find({
    collection: 'receipts' as never,
    where: { order: { equals: orderId } } as never,
    limit: 1,
    depth: 0,
  })
  if (existing.totalDocs > 0) {
    const doc = existing.docs[0] as { id: string | number; documentNumber: string }
    return { receiptId: doc.id, documentNumber: doc.documentNumber, created: false }
  }

  const order = (await payload.findByID({
    collection: 'orders' as never,
    id: orderId as never,
    depth: 1,
  })) as OrderShape | null
  if (!order) throw new Error(`Order ${orderId} not found`)

  const settings = (await payload.findGlobal({
    slug: 'shop-settings' as never,
    depth: 0,
  })) as ShopSettingsShape

  const templateId = (settings.receiptsTemplateId ?? 'pl-paragon') as ReceiptTemplateId
  const documentNumber = await nextDocumentNumber(payload, templateId)
  const data = buildReceiptData(order, settings, documentNumber)

  // Render PDF and upload to media collection so it gets a stable URL.
  const pdfBuffer = await renderReceipt({ templateId, data })
  const filename = `${documentNumber.replace(/\//g, '-')}.pdf`

  const mediaDoc = (await payload.create({
    collection: 'media' as never,
    data: {
      alt: `Receipt ${documentNumber}`,
    } as never,
    file: {
      data: pdfBuffer,
      mimetype: 'application/pdf',
      name: filename,
      size: pdfBuffer.length,
    },
    overrideAccess: true,
  })) as { id: string | number }

  const receipt = (await payload.create({
    collection: 'receipts' as never,
    data: {
      documentNumber,
      documentType: templateId,
      order: orderId,
      pdf: mediaDoc.id,
      issuedAt: data.issuedAt,
      totalAmount: data.totals.grandTotal,
      currency: data.currency,
      sellerSnapshot: data.seller as unknown as Record<string, unknown>,
      buyerSnapshot: data.buyer as unknown as Record<string, unknown>,
      lineItems: data.items as unknown as Record<string, unknown>[],
    } as never,
    overrideAccess: true,
  })) as { id: string | number }

  return { receiptId: receipt.id, documentNumber, created: true }
}

/**
 * Convenience reader for storefront/admin: returns receipt with media link populated.
 */
export async function getReceiptByOrder(payload: PayloadLike, orderId: string | number) {
  const result = await payload.find({
    collection: 'receipts' as never,
    where: { order: { equals: orderId } } as never,
    limit: 1,
    depth: 1,
  })
  if (result.totalDocs === 0) return null
  return result.docs[0]
}
