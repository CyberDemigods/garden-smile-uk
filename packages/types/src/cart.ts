import type { Product } from './product.ts'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  totalAmount: number
}
