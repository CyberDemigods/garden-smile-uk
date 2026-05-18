import { getPayloadClient } from '@/lib/payload'
import { HomeBlocks } from '@/components/home/HomeBlocks'
import { ReviewsCarousel } from '@/components/reviews/ReviewsCarousel'
import type { HomeBlockData } from '@demicommerce/module-cms'
import { organizationJsonLd, websiteJsonLd } from '@demicommerce/seo'
import { getAllApprovedReviews } from '@demicommerce/module-reviews/helpers'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021'
const SITE = { name: 'Garden Smile', url: SITE_URL }

export default async function HomePage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({
    slug: 'home-page' as never,
    locale: 'en' as never,
    depth: 2,
  })
  const blocks = ((home as { blocks?: HomeBlockData[] }).blocks ?? []) as HomeBlockData[]
  const reviews = await getAllApprovedReviews(payload, 50)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(SITE)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(SITE)) }}
      />
      <HomeBlocks blocks={blocks} />
      <ReviewsCarousel reviews={reviews} />
    </>
  )
}
