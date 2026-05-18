import Link from 'next/link'
import type { ReviewItem } from '@demicommerce/module-reviews/helpers'

interface ReviewsSectionProps {
  reviews: ReviewItem[]
  heading?: string
  eyebrow?: string
  showProductLink?: boolean
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

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))

export function ReviewsSection({
  reviews,
  heading = 'What our customers say',
  eyebrow = 'Real opinions',
  showProductLink = true,
}: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        {eyebrow && (
          <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
            {eyebrow}
          </span>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl mt-1">{heading}</h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review) => {
          const source = review.source ?? 'native'
          return (
            <article
              key={review.id}
              className="bg-white rounded-2xl p-6 border border-[rgb(var(--gs-leaf-light)/0.25)] flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE_STYLES[source]}`}
                >
                  {SOURCE_LABELS[source]}
                </span>
              </div>

              {review.title && (
                <h3 className="font-serif text-lg text-[rgb(var(--gs-leaf-deep))] leading-snug">
                  {review.title}
                </h3>
              )}

              <p className="text-sm text-[rgb(var(--gs-stone))] leading-relaxed line-clamp-5">
                {review.comment}
              </p>

              <footer className="mt-auto pt-3 border-t border-[rgb(var(--gs-leaf-light)/0.18)] flex items-center justify-between text-xs text-[rgb(var(--gs-stone)/0.85)]">
                <span className="font-medium">{review.authorName}</span>
                <span>{formatDate(review.createdAt)}</span>
              </footer>

              {showProductLink && review.productSlug && review.productName && (
                <Link
                  href={`/product/${review.productSlug}`}
                  className="text-xs text-[rgb(var(--gs-leaf))] hover:text-[rgb(var(--gs-leaf-deep))] transition-colors"
                >
                  → {review.productName}
                </Link>
              )}

              {review.sourceUrl && (
                <a
                  href={review.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[rgb(var(--gs-stone)/0.6)] hover:text-[rgb(var(--gs-leaf))] underline-offset-2 hover:underline"
                >
                  See original review ↗
                </a>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
