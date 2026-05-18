export interface CheckoutStep {
  id: string
  label: string
  order: number
}

export interface CheckoutData {
  customer: {
    email: string
    name: string
    phone?: string
  }
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  shippingMethodId: string
  wantInvoice: boolean
  invoiceData?: {
    companyName: string
    nip: string
    address: {
      street: string
      city: string
      postalCode: string
    }
  }
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
  }>
  locale?: string
}

export interface CheckoutResult {
  orderId: string
  orderNumber: string
  paymentUrl?: string
}
