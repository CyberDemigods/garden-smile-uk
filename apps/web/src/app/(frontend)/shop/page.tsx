import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getCategories, getProducts } from '@/lib/queries'
import { ProductCard } from '@/components/shop/ProductCard'

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>
}

export const metadata = {
  title: 'Shop',
  description: 'Browse the full Garden Smile collection — windmills, planters, wishing wells and more.',
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams
  const payload = await getPayloadClient()
  const [categories, products] = await Promise.all([
    getCategories(payload),
    getProducts(payload, { categorySlug: category }),
  ])

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl sm:text-5xl text-[rgb(var(--gs-leaf-deep))] mb-3">
          {category
            ? categories.find((c) => c.slug === category)?.name ?? 'Shop'
            : 'Everything in the garden'}
        </h1>
        <p className="text-[rgb(var(--gs-stone))] max-w-2xl">
          {products.total} {products.total === 1 ? 'product' : 'products'}.
          Hand-built wood and metal pieces, made to weather every season.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 mb-10" aria-label="Filter by category">
        <Link
          href="/shop"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-[rgb(var(--gs-leaf))] text-white'
              : 'bg-white/70 text-[rgb(var(--gs-stone))] hover:bg-[rgb(var(--gs-leaf-light)/0.18)]'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-[rgb(var(--gs-leaf))] text-white'
                : 'bg-white/70 text-[rgb(var(--gs-stone))] hover:bg-[rgb(var(--gs-leaf-light)/0.18)]'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.items.length === 0 ? (
        <p className="text-center py-20 text-[rgb(var(--gs-stone))]">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
