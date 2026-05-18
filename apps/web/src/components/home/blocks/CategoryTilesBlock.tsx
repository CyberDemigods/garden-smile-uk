import Image from 'next/image'
import Link from 'next/link'
import type { CategoryTilesBlockData } from '@demicommerce/module-cms'
import { getPayloadClient } from '@/lib/payload'

interface CategoryDoc {
  id?: string | number
  slug?: string
  name?: string
  image?: { url?: string; alt?: string } | string | number | null
}

const COLS_CLASS: Record<NonNullable<CategoryTilesBlockData['columns']>, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

const pluralizeProducts = (n: number) => (n === 1 ? `${n} product` : `${n} products`)

async function getCategoryEnrichment(
  categoryId: string | number,
): Promise<{ fallbackImage?: string; productCount: number }> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products' as never,
      where: {
        and: [
          { status: { equals: 'available' } },
          { category: { equals: categoryId } },
        ],
      } as never,
      limit: 1,
      depth: 2,
      sort: '-price',
    })

    const total = result.totalDocs ?? 0
    const firstProduct = (result.docs as Array<{ images?: Array<{ image?: unknown } | null> }>)[0]
    const img = firstProduct?.images?.[0]?.image
    const fallbackImage =
      img && typeof img === 'object' && 'url' in img ? (img as { url?: string }).url : undefined

    return { fallbackImage, productCount: total }
  } catch {
    return { productCount: 0 }
  }
}

export async function CategoryTilesBlock({ block }: { block: CategoryTilesBlockData }) {
  const cols = COLS_CLASS[block.columns ?? '4']
  const categories = (block.categories ?? [])
    .filter((c): c is CategoryDoc => c !== null && typeof c === 'object')
    .filter((c) => c.slug && c.name && c.id !== undefined)

  if (categories.length === 0) return null

  const enrichments = await Promise.all(
    categories.map((cat) => getCategoryEnrichment(cat.id!)),
  )

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        {block.eyebrow && (
          <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
            {block.eyebrow}
          </span>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl mt-1">{block.heading}</h2>
      </header>
      <div className={`grid grid-cols-2 ${cols} gap-4`}>
        {categories.map((cat, i) => {
          const adminImage =
            cat.image && typeof cat.image === 'object' && 'url' in cat.image
              ? (cat.image as { url?: string }).url
              : undefined
          const enrichment = enrichments[i]
          const imageUrl = adminImage || enrichment?.fallbackImage
          const count = enrichment?.productCount ?? 0

          return (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[rgb(var(--gs-leaf-deep))] flex flex-col justify-end p-6"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={cat.name!}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--gs-leaf))] to-[rgb(var(--gs-leaf-deep))]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
              <div className="relative z-10 flex flex-col gap-1">
                {count > 0 && (
                  <span
                    className="inline-flex items-center text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm self-start"
                    style={{ color: '#fff' }}
                  >
                    {pluralizeProducts(count)}
                  </span>
                )}
                <div className="flex items-end justify-between gap-3">
                  <h3
                    className="font-serif text-2xl sm:text-3xl leading-tight drop-shadow-md"
                    style={{ color: '#fff' }}
                  >
                    {cat.name}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="text-white/90 text-2xl translate-x-0 group-hover:translate-x-1 transition-transform"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
