export interface SeoSiteConfig {
  name: string
  url: string
  description?: string
  logoPath?: string
}

export function siteUrl(config: SeoSiteConfig, path = '') {
  return `${config.url}${path}`
}

export function organizationJsonLd(config: SeoSiteConfig) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    ...(config.logoPath && { logo: siteUrl(config, config.logoPath) }),
    ...(config.description && { description: config.description }),
  }
}

export function websiteJsonLd(
  config: SeoSiteConfig,
  options?: { searchPath?: string },
) {
  const searchPath = options?.searchPath ?? '/shop'
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl(config, searchPath)}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export interface AggregateRating {
  /** Average rating, e.g. 4.3 */
  ratingValue: number
  /** Number of reviews backing the rating. */
  reviewCount: number
  /** Optional explicit min/max scale. Defaults to 1..5. */
  bestRating?: number
  worstRating?: number
}

export function aggregateRatingJsonLd(rating: AggregateRating) {
  return {
    '@type': 'AggregateRating' as const,
    ratingValue: rating.ratingValue.toFixed(1),
    reviewCount: rating.reviewCount,
    bestRating: (rating.bestRating ?? 5).toString(),
    worstRating: (rating.worstRating ?? 1).toString(),
  }
}

export interface ReviewSnippet {
  rating: number
  title?: string
  body: string
  authorName: string
  datePublished: string
}

export function reviewJsonLd(review: ReviewSnippet) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: review.authorName,
    },
    datePublished: review.datePublished,
    ...(review.title && { name: review.title }),
    reviewBody: review.body,
  }
}

export function productJsonLd(
  config: SeoSiteConfig,
  product: {
    name: string
    slug: string
    description?: string
    price: number
    currency?: string
    imageUrl?: string
    status: string
    stock: number
  },
  options?: {
    aggregateRating?: AggregateRating
    reviews?: ReviewSnippet[]
  },
) {
  const defaultCurrency = 'GBP'
  const rating =
    options?.aggregateRating && options.aggregateRating.reviewCount > 0
      ? aggregateRatingJsonLd(options.aggregateRating)
      : undefined
  const reviews = options?.reviews?.map(reviewJsonLd)

  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Product',
    name: product.name,
    url: siteUrl(config, `/product/${product.slug}`),
    ...(product.description && { description: product.description }),
    ...(product.imageUrl && { image: product.imageUrl }),
    offers: {
      '@type': 'Offer',
      url: siteUrl(config, `/product/${product.slug}`),
      priceCurrency: product.currency || defaultCurrency,
      price: product.price.toFixed(2),
      availability:
        product.status === 'available' && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: config.name,
      },
    },
    ...(rating && { aggregateRating: rating }),
    ...(reviews && reviews.length > 0 && { review: reviews }),
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqPageJsonLd(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}
