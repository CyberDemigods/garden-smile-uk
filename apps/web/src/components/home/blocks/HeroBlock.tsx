import Image from 'next/image'
import Link from 'next/link'
import type { HeroBlockData } from '@demicommerce/module-cms'
import { getPayloadClient } from '@/lib/payload'

interface ProductForHero {
  name: string
  price?: number
  images?: Array<{ image?: { url?: string; alt?: string } | null } | null>
}

async function getFallbackHeroImage(): Promise<{ url: string; alt: string } | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products' as never,
      where: { status: { equals: 'available' } } as never,
      limit: 1,
      depth: 2,
      sort: '-price',
    })
    const product = (result.docs as unknown as ProductForHero[])[0]
    const img = product?.images?.[0]?.image
    if (img && typeof img === 'object' && 'url' in img && img.url) {
      return { url: img.url, alt: img.alt || product.name }
    }
    return null
  } catch {
    return null
  }
}

async function getCheapestPrice(): Promise<number | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products' as never,
      where: { status: { equals: 'available' } } as never,
      limit: 1,
      depth: 0,
      sort: 'price',
    })
    const product = (result.docs as unknown as ProductForHero[])[0]
    return typeof product?.price === 'number' ? product.price : null
  } catch {
    return null
  }
}

const MICRO_TRUST = ['Handmade in the UK', 'Dispatched in 48h', '14-day returns']

export async function HeroBlock({ block }: { block: HeroBlockData }) {
  const adminImage = block.image?.url
    ? { url: block.image.url, alt: block.image.alt || block.heading }
    : null
  const fallback = adminImage ? null : await getFallbackHeroImage()
  const heroImage = adminImage ?? fallback
  const cheapestPrice = await getCheapestPrice()

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-[rgb(var(--gs-leaf-light)/0.4)] blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 -left-40 w-[32rem] h-[32rem] rounded-full bg-[rgb(var(--gs-blush)/0.45)] blur-3xl pointer-events-none"
      />
      <Leaf className="absolute top-12 right-[8%] w-12 h-12 text-[rgb(var(--gs-leaf)/0.18)] animate-float-slow" />
      <Leaf className="absolute bottom-24 left-[6%] w-16 h-16 text-[rgb(var(--gs-leaf)/0.14)] -scale-x-100 animate-float" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 lg:py-28 grid gap-12 lg:gap-16 items-center md:grid-cols-2">
        <div>
          {block.eyebrow && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[rgb(var(--gs-leaf-light)/0.2)] text-[rgb(var(--gs-leaf-deep))] text-sm font-medium mb-6 border border-[rgb(var(--gs-leaf-light)/0.4)]">
              {block.eyebrow}
            </span>
          )}

          <h1 className="font-serif text-5xl sm:text-6xl md:text-6xl lg:text-7xl leading-[0.95] mb-6 tracking-tight">
            {block.heading}
            {block.headingAccent && (
              <>
                <br />
                <span className="italic text-[rgb(var(--gs-leaf))] font-light">
                  {block.headingAccent}
                </span>
              </>
            )}
          </h1>

          {block.subheading && (
            <p className="text-lg text-[rgb(var(--gs-stone))] max-w-xl mb-8 whitespace-pre-line leading-relaxed">
              {block.subheading}
            </p>
          )}

          <div className="flex items-center gap-3 mb-8 text-sm">
            <div className="flex text-[rgb(var(--gs-blush))]" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-[rgb(var(--gs-stone))]">
              <strong className="text-[rgb(var(--gs-leaf-deep))]">1,200+</strong> happy gardeners
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {block.primaryCta?.label && block.primaryCta.href && (
              <Link
                href={block.primaryCta.href}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[rgb(var(--gs-leaf))] text-white font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition shadow-lg shadow-[rgb(var(--gs-leaf)/0.3)]"
              >
                {block.primaryCta.label}
                <span aria-hidden="true">→</span>
              </Link>
            )}
            {block.secondaryCta?.label && block.secondaryCta.href && (
              <Link
                href={block.secondaryCta.href}
                className="inline-flex items-center px-8 py-4 rounded-full text-[rgb(var(--gs-leaf-deep))] font-medium hover:bg-[rgb(var(--gs-leaf-light)/0.18)] transition"
              >
                {block.secondaryCta.label}
              </Link>
            )}
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[rgb(var(--gs-stone))]">
            {MICRO_TRUST.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgb(var(--gs-leaf))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {heroImage ? (
            <>
              <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl rotate-2 z-10">
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {cheapestPrice !== null && (
                <div className="absolute -top-4 -right-4 z-20 bg-[rgb(var(--gs-blush))] text-[rgb(var(--gs-leaf-deep))] rounded-full w-24 h-24 flex flex-col items-center justify-center font-serif text-center shadow-xl rotate-12">
                  <span className="text-xs uppercase tracking-wider opacity-80">From</span>
                  <span className="text-2xl font-bold">£{cheapestPrice.toFixed(0)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-[rgb(var(--gs-leaf-light)/0.4)] to-[rgb(var(--gs-leaf-deep)/0.4)] flex items-center justify-center text-[rgb(var(--gs-stone)/0.6)]">
              <span className="font-serif text-2xl px-8 text-center">
                Add a hero image in the admin → Home page
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3 21 5 14 5.25 9 6.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  )
}
