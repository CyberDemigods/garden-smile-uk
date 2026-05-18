/**
 * Shared shape consumed by all PDF templates.
 *
 * Keep this language-agnostic — labels live in the template files themselves.
 */

export interface SellerInfo {
  name: string
  /** Free-form address — multi-line allowed (use \n). */
  address: string
  /** Tax / VAT ID. Empty when not applicable (e.g. PL działalność nierejestrowana). */
  taxId?: string
  /** Email shown on the document. */
  email?: string
  /** Phone shown on the document. */
  phone?: string
  /** Optional bank account number for transfer-paid orders. */
  bankAccount?: string
  /** Disclosure note below the seller block (e.g. legal basis for VAT exemption). */
  legalNote?: string
}

export interface BuyerInfo {
  name: string
  email: string
  /** Free-form delivery / billing address. */
  address?: string
  /** Optional company name + tax ID for invoices. */
  companyName?: string
  taxId?: string
}

export interface ReceiptLineItem {
  /** Display name (already localized). */
  name: string
  quantity: number
  /** Unit price after any discount, in the document currency. */
  unitPrice: number
  /** Quantity × unit price. */
  lineTotal: number
  /** Optional VAT rate (0..100). When absent, the document is VAT-free. */
  vatRate?: number
}

export interface ReceiptTotals {
  /** Sum of line totals before shipping / tax. */
  subtotal: number
  shippingCost: number
  /** VAT amount when applicable; 0 for paragony / VAT-exempt sales. */
  vatAmount: number
  grandTotal: number
}

export interface ReceiptData {
  documentNumber: string
  /** ISO timestamp when the receipt was issued. */
  issuedAt: string
  /** ISO timestamp when payment was confirmed. */
  paidAt?: string
  currency: string
  seller: SellerInfo
  buyer: BuyerInfo
  items: ReceiptLineItem[]
  totals: ReceiptTotals
  /** Original order number (e.g. for cross-reference with the storefront). */
  orderNumber?: string
  /** Payment method label as captured at checkout. */
  paymentMethod?: string
}

export type ReceiptTemplateId =
  | 'pl-paragon'
  | 'pl-invoice-vat'
  | 'pl-simplified-invoice'
  | 'uk-invoice'
