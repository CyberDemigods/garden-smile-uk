import Image from 'next/image'
import Link from 'next/link'
import { LowStockBadge } from '@/components/marketing/LowStockBadge'

export interface ProductCardData {
  slug: string
  name: string
  price: number
  currency: string
  imageUrl?: string | null
  imageAlt?: string
  categoryName?: string
  status?: 'available' | 'sold' | 'hidden'
  stock?: number
}

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const isAvailable = product.status !== 'sold' && (product.stock ?? 1) > 0

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-white/60 hover:bg-white rounded-2xl overflow-hidden border border-[rgb(var(--gs-leaf-light)/0.18)] hover:border-[rgb(var(--gs-leaf-light)/0.4)] transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200"
    >
      <div className="aspect-square relative bg-[rgb(var(--gs-cream))] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[rgb(var(--gs-stone)/0.4)] text-sm">
            No image
          </div>
        )}

        {!isAvailable && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[rgb(var(--gs-stone))] text-white text-xs font-medium rounded-full">
            Sold out
          </div>
        )}

        {isAvailable && (
          <div className="absolute top-3 left-3">
            <LowStockBadge stock={product.stock} />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {product.categoryName && (
          <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
            {product.categoryName}
          </span>
        )}
        <h3 className="font-serif text-lg leading-tight text-[rgb(var(--gs-leaf-deep))] line-clamp-2">
          {product.name}
        </h3>
        <span className="mt-auto text-lg font-medium text-[rgb(var(--gs-leaf-deep))]">
          {formatPrice(product.price, product.currency)}
        </span>
      </div>
    </Link>
  )
}
