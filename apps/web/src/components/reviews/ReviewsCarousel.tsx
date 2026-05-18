'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import type { ReviewItem } from '@demicommerce/module-reviews/helpers'

interface ReviewsCarouselProps {
  reviews: ReviewItem[]
  heading?: string
  eyebrow?: string
  showProductLink?: boolean
  dateLocale?: string
  autoplayDelayMs?: number
}

const SOURCE_LABELS: Record<NonNullable<ReviewItem['source']>, string> = {
  native: 'Verified customer',
  ebay: 'eBay',
  allegro: 'Allegro',
  google: 'Google',
  other: 'Other',
}

const SOURCE_BADGE_STYLES: Record<NonNullable<ReviewItem['source']>, string> = {
  native: 'bg-[rgb(var(--gs-leaf-light)/0.2)] text-[rgb(var(--gs-leaf-deep))]',
  ebay: 'bg-[#E53238]/12 text-[#E53238]',
  allegro: 'bg-[#FF5A00]/12 text-[#C84200]',
  google: 'bg-[#4285F4]/12 text-[#1A56DB]',
  other: 'bg-[rgb(var(--gs-stone)/0.15)] text-[rgb(var(--gs-stone))]',
}

const AVATAR_COLOURS = [
  'bg-[rgb(var(--gs-leaf))]',
  'bg-[rgb(var(--gs-bark))]',
  'bg-[rgb(var(--gs-leaf-deep))]',
  'bg-[#8b6f47]',
  'bg-[#a07b54]',
]

function initials(name: string) {
  const cleaned = name.replace(/\*/g, '').trim()
  if (!cleaned) return '?'
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

function avatarColour(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i)
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length]
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < full ? '#E0C690' : 'none'}
          stroke="#E0C690"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsCarousel({
  reviews,
  heading = 'What our customers say',
  eyebrow = 'Real opinions',
  showProductLink = true,
  dateLocale = 'en-GB',
  autoplayDelayMs = 4500,
}: ReviewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: false, slidesToScroll: 1 },
    [Autoplay({ delay: autoplayDelayMs, stopOnInteraction: false, stopOnMouseEnter: true })],
  )
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect).on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(dateLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))

  if (!reviews || reviews.length === 0) return null

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 relative">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          {eyebrow && (
            <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
              {eyebrow}
            </span>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl mt-1">{heading}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--gs-stone))]">
          <Stars rating={avgRating} />
          <span className="font-semibold text-[rgb(var(--gs-leaf-deep))]">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-[rgb(var(--gs-stone)/0.75)]">
            · {reviews.length} reviews
          </span>
        </div>
      </header>

      <div className="relative">
        <div className="overflow-hidden -mx-6 px-6" ref={emblaRef}>
          <div className="flex gap-6">
            {reviews.map((review) => {
              const source = review.source ?? 'native'
              const author = review.authorName
              return (
                <article
                  key={review.id}
                  className="relative shrink-0 grow-0 basis-[320px] sm:basis-[360px] md:basis-[400px] min-h-[280px] bg-gradient-to-br from-white to-[rgb(var(--gs-cream))] rounded-2xl p-7 border border-[rgb(var(--gs-leaf-light)/0.25)] flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out"
                >
                  <svg
                    className="absolute top-4 right-5 text-[rgb(var(--gs-leaf-light)/0.35)]"
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-2v-10h7.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-2v-10h7.983z" />
                  </svg>

                  <header className="flex items-center gap-3 relative z-10">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-full ${avatarColour(author)} flex items-center justify-center text-white font-serif text-base select-none shadow-sm`}
                      aria-hidden="true"
                    >
                      {initials(author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[rgb(var(--gs-leaf-deep))] truncate">
                        {author}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Stars rating={review.rating} />
                        <span
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${SOURCE_BADGE_STYLES[source]}`}
                        >
                          {SOURCE_LABELS[source]}
                        </span>
                      </div>
                    </div>
                  </header>

                  {review.title && (
                    <h3 className="font-serif text-lg text-[rgb(var(--gs-leaf-deep))] leading-snug line-clamp-2 relative z-10">
                      {review.title}
                    </h3>
                  )}

                  <p className="text-sm text-[rgb(var(--gs-stone))] leading-relaxed line-clamp-5 flex-1 relative z-10">
                    {review.comment}
                  </p>

                  <footer className="pt-3 border-t border-[rgb(var(--gs-leaf-light)/0.18)] flex items-center justify-between text-xs text-[rgb(var(--gs-stone)/0.7)] relative z-10">
                    <span>{formatDate(review.createdAt)}</span>
                    {review.sourceUrl && (
                      <a
                        href={review.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[rgb(var(--gs-leaf))] underline-offset-2 hover:underline"
                      >
                        See original ↗
                      </a>
                    )}
                  </footer>

                  {showProductLink && review.productSlug && review.productName && (
                    <Link
                      href={`/product/${review.productSlug}`}
                      className="text-xs text-[rgb(var(--gs-leaf))] hover:text-[rgb(var(--gs-leaf-deep))] transition-colors line-clamp-1 relative z-10"
                    >
                      → {review.productName}
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        </div>

        {/* Subtle fade gradients + arrows tucked into the edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[rgb(var(--gs-cream))] via-[rgb(var(--gs-cream)/0.7)] to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[rgb(var(--gs-cream))] via-[rgb(var(--gs-cream)/0.7)] to-transparent" aria-hidden="true" />

        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canPrev}
          aria-label="Previous review"
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm border border-[rgb(var(--gs-leaf-light)/0.3)] text-[rgb(var(--gs-leaf-deep))] hover:bg-white hover:scale-110 disabled:opacity-0 transition-all duration-200 z-20 shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canNext}
          aria-label="Next review"
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm border border-[rgb(var(--gs-leaf-light)/0.3)] text-[rgb(var(--gs-leaf-deep))] hover:bg-white hover:scale-110 disabled:opacity-0 transition-all duration-200 z-20 shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
