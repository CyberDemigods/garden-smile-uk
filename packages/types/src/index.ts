export type { Product, ProductImage, ProductStatus, Category } from './product.ts'
export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  CustomerInfo,
  Address,
  InvoiceData,
} from './order.ts'
export type { CartItem, Cart } from './cart.ts'
export type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentSession,
  PaymentVerification,
} from './payment.ts'

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Settings types
export interface ShopSettings {
  shopName: string
  shopDescription: string
  contactEmail: string
  shippingMethods: ShippingMethod[]
  freeShippingThreshold?: number
  currency: string
  socialLinks: {
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
  }
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedTime: string
  description?: string
  active: boolean
}
