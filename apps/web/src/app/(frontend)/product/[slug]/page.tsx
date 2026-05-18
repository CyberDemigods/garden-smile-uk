import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries'
import { lexicalToParagraphs } from '@/lib/lexical'
import { ProductCard } from '@/components/shop/ProductCard'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { WishlistToggleButton } from '@/components/wishlist/WishlistToggleButton'
import { LowStockBadge } from '@/components/marketing/LowStockBadge'
import { productJsonLd } from '@demicommerce/seo'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const product = await getProductBySlug(payload, slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: lexicalToParagraphs(product.description)[0]?.slice(0, 160),
  }
}

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const product = await getProductBySlug(payload, slug)
  if (!product) notFound()

  const related = product.category
    ? await getRelatedProducts(payload, product.category.id, product.id, 4)
    : []

  const description = lexicalToParagraphs(product.description)
  const isAvailable = product.status === 'available' && product.stock > 0

  const jsonLd = productJsonLd(
    { name: 'Garden Smile', url: SITE_URL },
    {
      name: product.name,
      slug: product.slug,
      description: description[0],
      price: product.price,
      currency: 'GBP',
      imageUrl: product.images[0]?.url,
      status: product.status,
      stock: product.stock,
    },
  )

  return (
    <article className="max-w-6xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-[rgb(var(--gs-stone))] mb-8" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-[rgb(var(--gs-leaf))]">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2 opacity-40">/</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-[rgb(var(--gs-leaf))]"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2 opacity-40">/</span>
        <span className="text-[rgb(var(--gs-leaf-deep))]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square relative bg-[rgb(var(--gs-cream))] rounded-2xl overflow-hidden border border-[rgb(var(--gs-leaf-light)/0.18)]">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[rgb(var(--gs-stone)/0.4)]">
                No image
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square relative bg-[rgb(var(--gs-cream))] rounded-lg overflow-hidden border border-[rgb(var(--gs-leaf-light)/0.18)]"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${product.name} — image ${i + 2}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.category && (
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium hover:text-[rgb(var(--gs-leaf-deep))]"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="font-serif text-4xl md:text-5xl text-[rgb(var(--gs-leaf-deep))] leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-medium text-[rgb(var(--gs-leaf-deep))]">
              {formatPrice(product.price, product.currency)}
            </span>
            {!isAvailable && (
              <span className="px-2 py-1 bg-[rgb(var(--gs-stone))] text-white text-xs font-medium rounded-full">
                Sold out
              </span>
            )}
            {isAvailable && <LowStockBadge stock={product.stock} />}
          </div>

          {description.length > 0 && (
            <div className="prose prose-stone max-w-none mt-2 text-[rgb(var(--gs-stone))]">
              {description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {(product.dimensions?.width ||
            product.dimensions?.height ||
            product.dimensions?.depth) && (
            <dl className="grid grid-cols-3 gap-4 mt-4 p-4 bg-white/60 rounded-xl border border-[rgb(var(--gs-leaf-light)/0.18)]">
              {[
                ['Height', product.dimensions?.height],
                ['Width', product.dimensions?.width],
                ['Depth', product.dimensions?.depth],
              ]
                .filter(([, val]) => val)
                .map(([label, val]) => (
                  <div key={label as string}>
                    <dt className="text-xs uppercase tracking-wider text-[rgb(var(--gs-stone)/0.7)]">
                      {label}
                    </dt>
                    <dd className="text-lg text-[rgb(var(--gs-leaf-deep))] font-medium">
                      {val} cm
                    </dd>
                  </div>
                ))}
            </dl>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              image={product.images[0]?.url ?? null}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Add to cart' : 'Out of stock'}
            </AddToCartButton>
            <WishlistToggleButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              image={product.images[0]?.url ?? null}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-serif text-3xl text-[rgb(var(--gs-leaf-deep))] mb-8">
            More in {product.category?.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
