export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  shippingCost: number
  shippingMethod?: string
  trackingNumber?: string
  status: OrderStatus
  customer: CustomerInfo
  shippingAddress: Address
  wantInvoice: boolean
  invoiceData?: InvoiceData
  paymentId?: string
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  productImage?: string
  price: number
  quantity: number
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export type PaymentMethod = 'blik' | 'transfer' | 'card'

export interface CustomerInfo {
  email: string
  name: string
  phone?: string
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

export interface InvoiceData {
  companyName: string
  nip: string
  address: Address
}
