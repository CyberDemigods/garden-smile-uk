export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: ProductImage[]
  category?: Category
  categoryId?: string
  status: ProductStatus
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  width: number
  height: number
}

export type ProductStatus = 'available' | 'sold' | 'hidden'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
}
