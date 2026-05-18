import PDFDocument from 'pdfkit'
import { existsSync } from 'fs'
import type { ReceiptData, ReceiptTemplateId } from '../templates/types.ts'

/**
 * System fonts known to ship Polish diacritics. The first one we find on disk is used.
 * Override via process.env.RECEIPTS_FONT_PATH for custom deployments (e.g. Vercel).
 */
const FONT_CANDIDATES = [
  process.env.RECEIPTS_FONT_PATH || '',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  'C:\\Windows\\Fonts\\arial.ttf',
].filter(Boolean)

const FONT_BOLD_CANDIDATES = [
  process.env.RECEIPTS_FONT_BOLD_PATH || '',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  'C:\\Windows\\Fonts\\arialbd.ttf',
].filter(Boolean)

function resolveFont(candidates: string[]): string | undefined {
  for (const path of candidates) {
    if (existsSync(path)) return path
  }
  return undefined
}

export interface RenderOptions {
  templateId: ReceiptTemplateId
  data: ReceiptData
  /** When true, layout in Polish; false → English. Auto-detected from templateId. */
  language?: 'pl' | 'en'
}

const LABELS = {
  pl: {
    paragon: 'Paragon (sprzedaż w ramach działalności nierejestrowanej)',
    invoiceVat: 'Faktura VAT',
    simplifiedInvoice: 'Faktura uproszczona',
    seller: 'Sprzedawca',
    buyer: 'Nabywca',
    documentNumber: 'Numer dokumentu',
    issuedAt: 'Data wystawienia',
    paidAt: 'Data zapłaty',
    orderNumber: 'Numer zamówienia',
    paymentMethod: 'Forma płatności',
    item: 'Nazwa towaru',
    qty: 'Ilość',
    unitPrice: 'Cena jedn.',
    vatRate: 'VAT',
    lineTotal: 'Wartość',
    subtotal: 'Suma',
    shipping: 'Dostawa',
    vatAmount: 'VAT',
    total: 'Do zapłaty',
    taxId: 'NIP',
    bankAccount: 'Rachunek bankowy',
    page: 'Strona',
  },
  en: {
    paragon: 'Sales receipt',
    invoiceVat: 'VAT Invoice',
    simplifiedInvoice: 'Simplified Invoice',
    seller: 'Seller',
    buyer: 'Buyer',
    documentNumber: 'Document number',
    issuedAt: 'Issued',
    paidAt: 'Paid',
    orderNumber: 'Order number',
    paymentMethod: 'Payment method',
    item: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit price',
    vatRate: 'VAT',
    lineTotal: 'Line total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    vatAmount: 'VAT',
    total: 'Total',
    taxId: 'VAT no.',
    bankAccount: 'Bank account',
    page: 'Page',
  },
}

const TITLES: Record<ReceiptTemplateId, keyof typeof LABELS.pl> = {
  'pl-paragon': 'paragon',
  'pl-invoice-vat': 'invoiceVat',
  'pl-simplified-invoice': 'simplifiedInvoice',
  'uk-invoice': 'invoiceVat',
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`
}

function formatDate(iso: string) {
  return iso.slice(0, 10)
}

/**
 * Render a receipt to a PDF buffer. Layout is intentionally compact (one page
 * for typical orders) and language-agnostic — labels are picked from the LABELS
 * map based on the template's locale.
 */
export async function renderReceipt(opts: RenderOptions): Promise<Buffer> {
  const { templateId, data } = opts
  const language = opts.language ?? (templateId.startsWith('pl-') ? 'pl' : 'en')
  const labels = LABELS[language]

  const fontPath = resolveFont(FONT_CANDIDATES)
  const fontBoldPath = resolveFont(FONT_BOLD_CANDIDATES)

  const doc = new PDFDocument({ size: 'A4', margin: 48 })
  const buffers: Buffer[] = []
  doc.on('data', (chunk: Buffer) => buffers.push(chunk))

  if (fontPath) {
    doc.registerFont('body', fontPath)
    doc.font('body')
  }
  if (fontBoldPath) {
    doc.registerFont('bold', fontBoldPath)
  }

  // Header
  doc
    .font(fontBoldPath ? 'bold' : 'Helvetica-Bold')
    .fontSize(16)
    .text(labels[TITLES[templateId]], { align: 'left' })
    .moveDown(0.5)

  doc
    .font(fontPath ? 'body' : 'Helvetica')
    .fontSize(10)
    .text(`${labels.documentNumber}: ${data.documentNumber}`)
    .text(`${labels.issuedAt}: ${formatDate(data.issuedAt)}`)
  if (data.paidAt) doc.text(`${labels.paidAt}: ${formatDate(data.paidAt)}`)
  if (data.orderNumber) doc.text(`${labels.orderNumber}: ${data.orderNumber}`)
  if (data.paymentMethod) doc.text(`${labels.paymentMethod}: ${data.paymentMethod}`)

  doc.moveDown(1)

  // Two-column seller / buyer block
  const colWidth = (doc.page.width - 96) / 2
  const colY = doc.y

  doc.font(fontBoldPath ? 'bold' : 'Helvetica-Bold').fontSize(11).text(labels.seller, 48, colY)
  doc.font(fontPath ? 'body' : 'Helvetica').fontSize(10)
  doc.text(data.seller.name)
  if (data.seller.address) doc.text(data.seller.address)
  if (data.seller.taxId) doc.text(`${labels.taxId}: ${data.seller.taxId}`)
  if (data.seller.email) doc.text(data.seller.email)
  if (data.seller.phone) doc.text(data.seller.phone)
  if (data.seller.bankAccount) doc.text(`${labels.bankAccount}: ${data.seller.bankAccount}`)
  const sellerEndY = doc.y

  doc.font(fontBoldPath ? 'bold' : 'Helvetica-Bold').fontSize(11).text(labels.buyer, 48 + colWidth + 16, colY)
  doc.font(fontPath ? 'body' : 'Helvetica').fontSize(10)
  doc.text(data.buyer.companyName || data.buyer.name, { width: colWidth })
  if (data.buyer.address) doc.text(data.buyer.address, { width: colWidth })
  if (data.buyer.taxId) doc.text(`${labels.taxId}: ${data.buyer.taxId}`, { width: colWidth })
  doc.text(data.buyer.email, { width: colWidth })
  const buyerEndY = doc.y

  doc.x = 48
  doc.y = Math.max(sellerEndY, buyerEndY) + 16

  // Items table
  const tableTop = doc.y
  const cols = {
    name: 48,
    qty: 280,
    unit: 340,
    vat: 420,
    total: 470,
  }

  doc.font(fontBoldPath ? 'bold' : 'Helvetica-Bold').fontSize(10)
  doc.text(labels.item, cols.name, tableTop)
  doc.text(labels.qty, cols.qty, tableTop, { width: 50, align: 'right' })
  doc.text(labels.unitPrice, cols.unit, tableTop, { width: 70, align: 'right' })
  if (data.totals.vatAmount > 0) doc.text(labels.vatRate, cols.vat, tableTop, { width: 40, align: 'right' })
  doc.text(labels.lineTotal, cols.total, tableTop, { width: doc.page.width - cols.total - 48, align: 'right' })

  doc.font(fontPath ? 'body' : 'Helvetica').fontSize(10)
  let y = tableTop + 18

  for (const item of data.items) {
    const rightEdge = doc.page.width - 48
    doc.text(item.name, cols.name, y, { width: cols.qty - cols.name - 8 })
    doc.text(String(item.quantity), cols.qty, y, { width: 50, align: 'right' })
    doc.text(formatMoney(item.unitPrice, data.currency), cols.unit, y, { width: 70, align: 'right' })
    if (data.totals.vatAmount > 0) {
      doc.text(item.vatRate ? `${item.vatRate}%` : '—', cols.vat, y, { width: 40, align: 'right' })
    }
    doc.text(formatMoney(item.lineTotal, data.currency), cols.total, y, {
      width: rightEdge - cols.total,
      align: 'right',
    })
    y = doc.y + 4
  }

  doc.moveTo(48, y).lineTo(doc.page.width - 48, y).stroke()
  y += 8

  // Totals
  const totalsX = cols.unit
  const totalsValueX = cols.total
  const totalsValueWidth = doc.page.width - 48 - totalsValueX

  doc.text(labels.subtotal, totalsX, y, { width: cols.total - totalsX - 8, align: 'right' })
  doc.text(formatMoney(data.totals.subtotal, data.currency), totalsValueX, y, {
    width: totalsValueWidth,
    align: 'right',
  })
  y = doc.y + 2

  if (data.totals.shippingCost > 0) {
    doc.text(labels.shipping, totalsX, y, { width: cols.total - totalsX - 8, align: 'right' })
    doc.text(formatMoney(data.totals.shippingCost, data.currency), totalsValueX, y, {
      width: totalsValueWidth,
      align: 'right',
    })
    y = doc.y + 2
  }

  if (data.totals.vatAmount > 0) {
    doc.text(labels.vatAmount, totalsX, y, { width: cols.total - totalsX - 8, align: 'right' })
    doc.text(formatMoney(data.totals.vatAmount, data.currency), totalsValueX, y, {
      width: totalsValueWidth,
      align: 'right',
    })
    y = doc.y + 2
  }

  doc.font(fontBoldPath ? 'bold' : 'Helvetica-Bold').fontSize(11)
  doc.text(labels.total, totalsX, y + 4, { width: cols.total - totalsX - 8, align: 'right' })
  doc.text(formatMoney(data.totals.grandTotal, data.currency), totalsValueX, y + 4, {
    width: totalsValueWidth,
    align: 'right',
  })

  // Legal note (e.g. działalność nierejestrowana disclosure)
  if (data.seller.legalNote) {
    doc.font(fontPath ? 'body' : 'Helvetica').fontSize(8).fillColor('#555')
    doc.text(data.seller.legalNote, 48, doc.page.height - 80, {
      width: doc.page.width - 96,
      align: 'left',
    })
    doc.fillColor('black')
  }

  doc.end()

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)
  })
}
