import Link from 'next/link'
import type { FeaturedProductsBlockData } from '@demicommerce/module-cms'
import { ProductCard, type ProductCardData } from '@/components/shop/ProductCard'

interface ProductDoc {
  id?: string | number
  slug?: string
  name?: string
  price?: number
  status?: 'available' | 'sold' | 'hidden'
  stock?: number
  category?: { name?: string } | string | number | null
  images?: Array<{ image?: { url?: string; alt?: string } | string | number | null } | null>
}

export function FeaturedProductsBlock({ block }: { block: FeaturedProductsBlockData }) {
  const products = (block.products ?? [])
    .filter((p): p is ProductDoc => p !== null && typeof p === 'object')
    .map((p): ProductCardData | null => {
      if (!p.slug || !p.name || typeof p.price !== 'number') return null
      const firstImage = p.images?.[0]?.image
      const imageUrl =
        firstImage && typeof firstImage === 'object' && 'url' in firstImage
          ? (firstImage as { url?: string }).url
          : undefined
      const categoryName =
        p.category && typeof p.category === 'object' && 'name' in p.category
          ? (p.category as { name?: string }).name
          : undefined
      return {
        slug: p.slug,
        name: p.name,
        price: p.price,
        currency: 'GBP',
        imageUrl: imageUrl ?? null,
        categoryName,
        status: p.status,
        stock: p.stock,
      }
    })
    .filter((p): p is ProductCardData => p !== null)

  if (products.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          {block.eyebrow && (
            <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
              {block.eyebrow}
            </span>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-[rgb(var(--gs-leaf-deep))] mt-1">
            {block.heading}
          </h2>
        </div>
        {block.viewAllHref && (
          <Link
            href={block.viewAllHref}
            className="text-sm text-[rgb(var(--gs-leaf))] hover:text-[rgb(var(--gs-leaf-deep))] underline whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  )
}
