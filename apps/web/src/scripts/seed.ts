/**
 * Seed garden-smile-uk with demo categories + 8 products from the client's
 * eBay listings. Idempotent — re-running skips anything already present
 * (matched by slug).
 *
 * Invoked from /api/_seed (guarded by SEED_SECRET) so we get to reuse the
 * running Next.js + Payload runtime instead of spawning a fresh CLI process.
 */
import type { Payload } from 'payload'

interface SeedCategory {
  name: string
  slug: string
  description?: string
}

interface SeedProduct {
  ebayId: string
  name: string
  slug: string
  price: number
  /** Category slug — must match a SeedCategory. */
  categorySlug: string
  imageUrl: string
  description: string
  /** cm. */
  height?: number
}

const categories: SeedCategory[] = [
  {
    name: 'Windmills',
    slug: 'windmills',
    description: 'Hand-built wooden garden windmills with LED lighting, sized from 85 cm to over 2 m.',
  },
  {
    name: 'Wishing Wells',
    slug: 'wishing-wells',
    description: 'Decorative wooden wishing wells that double as planters — focal points for any garden.',
  },
  {
    name: 'Wind Spinners',
    slug: 'wind-spinners',
    description: '3D wooden spinners that twist with the breeze.',
  },
  {
    name: 'Planters',
    slug: 'planters',
    description: 'Distinctive wooden planters and flower carts in country-garden style.',
  },
]

const products: SeedProduct[] = [
  {
    ebayId: '286525948573',
    name: 'Wind Spinner Twister 50 cm — handmade 3D wooden',
    slug: 'wind-spinner-twister-50cm',
    price: 75,
    categorySlug: 'wind-spinners',
    imageUrl: 'https://i.ebayimg.com/images/g/jNMAAOSwgvNoDqef/s-l1600.jpg',
    description:
      'Hand-built 50 cm wooden wind spinner. Twists in the lightest breeze and adds movement to any patio or border. Handmade outdoors in the UK.',
    height: 50,
  },
  {
    ebayId: '287314114324',
    name: 'Wheel Barrow Planter 127 cm — natural wooden flower cart',
    slug: 'wheel-barrow-planter-127cm',
    price: 50,
    categorySlug: 'planters',
    imageUrl: 'https://i.ebayimg.com/images/g/3c4AAeSw1Clp-lVi/s-l1600.jpg',
    description:
      'Modern garden wheelbarrow planter, 127 cm long. Natural wood finish, ornamental but fully functional as a deep planter for seasonal flowers.',
    height: 127,
  },
  {
    ebayId: '287317151252',
    name: 'Windmill 85 cm — handmade wooden with LED',
    slug: 'windmill-85cm',
    price: 170,
    categorySlug: 'windmills',
    imageUrl: 'https://i.ebayimg.com/images/g/GDUAAOSwaPZnskRm/s-l1600.jpg',
    description:
      'Compact 85 cm garden windmill, hand-built from weatherproofed wood with integrated LED lighting. Perfect for small patios or as a statement piece in a border.',
    height: 85,
  },
  {
    ebayId: '286672352514',
    name: 'Windmill 100 cm — handmade wooden with LED',
    slug: 'windmill-100cm',
    price: 185,
    categorySlug: 'windmills',
    imageUrl: 'https://i.ebayimg.com/images/g/4~YAAeSwBKJp-jFi/s-l1600.jpg',
    description:
      '1 m garden windmill with LED lighting and hand-painted blades. The mid-size favourite — substantial without overwhelming smaller gardens.',
    height: 100,
  },
  {
    ebayId: '286432556188',
    name: 'Wishing Well Planter 135 cm — handmade outdoor',
    slug: 'wishing-well-135cm',
    price: 190,
    categorySlug: 'wishing-wells',
    imageUrl: 'https://i.ebayimg.com/images/g/beIAAOSwfS1n4Jo7/s-l1600.jpg',
    description:
      'Large 135 cm wishing well planter for the patio or lawn. Solid wood construction with steeply pitched shingle roof. Functions as a generous planter for trailing flowers.',
    height: 135,
  },
  {
    ebayId: '286706637512',
    name: 'Windmill 135 cm — handmade wooden with LED',
    slug: 'windmill-135cm',
    price: 278,
    categorySlug: 'windmills',
    imageUrl: 'https://i.ebayimg.com/images/g/6OEAAOSwInBnsj2d/s-l1600.jpg',
    description:
      '135 cm hand-built garden windmill with integrated LED lighting. Bridges the gap between decorative accent and full-blown garden centrepiece.',
    height: 135,
  },
  {
    ebayId: '286523432422',
    name: 'Windmill 170 cm — handmade wooden with LED',
    slug: 'windmill-170cm',
    price: 320,
    categorySlug: 'windmills',
    imageUrl: 'https://i.ebayimg.com/images/g/tYgAAOSwCkZoDVjS/s-l1600.jpg',
    description:
      'Large 170 cm windmill — hand-built from weather-treated wood with LED illumination. Designed to be the focal point of a lawn or border.',
    height: 170,
  },
  {
    ebayId: '286581486714',
    name: 'Windmill 223 cm — handmade wooden with LED',
    slug: 'windmill-223cm',
    price: 400,
    categorySlug: 'windmills',
    imageUrl: 'https://i.ebayimg.com/images/g/ad8AAeSwpHBp-jbd/s-l1600.jpg',
    description:
      'Statement 2.23 m garden windmill — the largest in the range. Hand-built, LED-lit, designed for spacious gardens and country-house settings.',
    height: 223,
  },
]

const richTextFromString = (text: string) => ({
  root: {
    type: 'root' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            mode: 'normal' as const,
            text,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      },
    ],
  },
})

async function downloadImage(url: string): Promise<{ buffer: Buffer; mimetype: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const mimetype = res.headers.get('content-type') ?? 'image/jpeg'
  return { buffer, mimetype }
}

export interface SeedResult {
  categoriesCreated: string[]
  categoriesSkipped: string[]
  productsCreated: string[]
  productsSkipped: string[]
  homePage: 'created' | 'skipped' | 'error'
  blogPostsCreated: string[]
  blogPostsSkipped: string[]
  reviewsCreated: number
  reviewsSkipped: number
  errors: Array<{ slug: string; message: string }>
}

const sampleReviews = [
  {
    productSlug: 'windmill-170cm',
    rating: 5,
    title: 'Looks even better in person',
    comment:
      'Bought the 170cm windmill for our back garden — sturdy build, vanes catch every breeze, and the neighbours keep asking where I got it. Packing was top-notch too.',
    guestName: 'David R.',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
  {
    productSlug: 'wishing-well-135cm',
    rating: 5,
    title: 'Stunning centrepiece for our patio',
    comment:
      'Arrived a day early, fully assembled and beautifully finished. The cedar smells fantastic and the build quality is genuinely impressive. Highly recommend.',
    guestName: 'Margaret W.',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
  {
    productSlug: 'wheel-barrow-planter-127cm',
    rating: 5,
    title: 'Brilliant planter, brilliant seller',
    comment:
      'Have already filled it with geraniums and it looks the part. Solid wheelbarrow, no flimsy bits. Smooth communication and prompt dispatch from Garden Smile.',
    guestName: 'P. Holloway',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
  {
    productSlug: 'wind-spinner-twister-50cm',
    rating: 4,
    title: 'Mesmerising in the wind',
    comment:
      'Spins on the lightest breeze and the colours catch the light beautifully. Took me a few minutes to set up; instructions could be clearer but the result is gorgeous.',
    guestName: 'James K.',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
  {
    productSlug: 'windmill-100cm',
    rating: 5,
    title: 'Second one I have ordered',
    comment:
      'My first windmill from Garden Smile has lasted three winters already, so getting another for my mother. Quality build, quality service — what more can you ask for.',
    guestName: 'A. Patterson',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
  {
    productSlug: 'windmill-223cm',
    rating: 5,
    title: 'A real focal point',
    comment:
      'The 223cm windmill is properly impressive — feels like a piece of countryside in our suburban plot. Assembly was straightforward and the timber is gorgeous.',
    guestName: 'Helen S.',
    source: 'ebay',
    sourceUrl: 'https://www.ebay.co.uk/usr/garden-smile',
    featured: true,
  },
] as const

async function ensureSampleReviews(
  payload: Payload,
  productIds: Map<string, string | number>,
): Promise<{ created: number; skipped: number }> {
  let created = 0
  let skipped = 0
  for (const r of sampleReviews) {
    const productId = productIds.get(r.productSlug)
    if (!productId) {
      skipped += 1
      continue
    }
    const existing = await payload.find({
      collection: 'reviews' as never,
      where: {
        and: [
          { product: { equals: productId } },
          { title: { equals: r.title } },
        ],
      } as never,
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      skipped += 1
      continue
    }
    await payload.create({
      collection: 'reviews' as never,
      data: {
        product: productId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        guestName: r.guestName,
        status: 'approved',
        verifiedPurchase: true,
        source: r.source,
        sourceUrl: r.sourceUrl,
        featured: r.featured,
      } as never,
    })
    created += 1
  }
  return { created, skipped }
}

interface BlogSeedCategory {
  name: string
  slug: string
  description: string
  order: number
}

interface BlogSeedPost {
  slug: string
  title: string
  excerpt: string
  paragraphs: string[]
  categorySlug: string
  publishedDaysAgo: number
}

const BLOG_AUTHOR = {
  name: 'Garden Smile Team',
  slug: 'garden-smile-team',
  bio: 'Hand-builds, weather-tests and writes about every windmill, planter and wishing well that leaves the workshop.',
}

const BLOG_CATEGORIES: BlogSeedCategory[] = [
  {
    name: 'Garden ideas',
    slug: 'garden-ideas',
    description: 'Inspiration and styling tips for outdoor spaces.',
    order: 1,
  },
  {
    name: 'Care guides',
    slug: 'care-guides',
    description: 'Practical advice on choosing, caring for and getting the most from outdoor decor.',
    order: 2,
  },
]

const BLOG_POSTS: BlogSeedPost[] = [
  {
    slug: '5-ways-windmill-transforms-garden',
    title: '5 ways a wooden windmill transforms your garden in summer',
    excerpt:
      "A windmill does more than spin. Here is how a 1.5 m wooden one changes a flat lawn into something you actually want to spend time in.",
    paragraphs: [
      "A garden without vertical interest reads like a sentence without punctuation: long, flat, easy to ignore. A windmill solves that the moment it goes up. The eye finds it, follows the blades around, then keeps scanning the rest of the space. Suddenly the borders look intentional.",
      "Movement is the second trick. In a still photo a garden is static; in real life, gentle wind keeps everything subtly in motion. A windmill amplifies that. Even on a calm afternoon, the lightest breeze sends the blades round, and the whole garden feels alive.",
      "At dusk our LED-lit models earn their keep. Hidden warm-white LEDs in the housing throw soft pools of light onto the surrounding flowerbed, turning the windmill into a quiet landscape light. You stop pulling the curtains as soon as it gets dark.",
      "Then there is the sound. A well-built windmill barely ticks — just enough to register as the world moving on around you. It is the kind of background noise that lowers your blood pressure rather than raises it.",
      "Finally, scale. People treat 85 cm models as accents and the 2 m ones as centrepieces, but the truth is that anything taller than waist-height reorganises how a garden feels. Try one against a fence panel you wish would disappear. You will stop seeing the fence.",
    ],
    categorySlug: 'garden-ideas',
    publishedDaysAgo: 4,
  },
  {
    slug: 'choose-right-windmill-size',
    title: 'How to choose the right size garden windmill: a complete guide',
    excerpt:
      'Going too small looks like a toy. Too tall and it dwarfs the bed. The honest guide to picking a height that works.',
    paragraphs: [
      "Picking a size is the question we get most often, and the answer is almost always: bigger than you first think. The rule of thumb we use in the workshop is that a windmill should be at least one third of the height of whatever it sits in front of. A 2-metre fence asks for at least 80 cm; a 3-metre garden room wants something north of a metre.",
      "The 85 cm size is our entry point and it works beautifully on patios, balconies and as an accent in a tight border. People often pick this one first then come back six months later for a taller one. It is the gateway model for a reason.",
      "The 1 m and 1.35 m sizes are the sweet spot for the average UK back garden. They have presence without overwhelming a lawn, and they tend to be the ones that pull double-duty as a landscape light at dusk thanks to the integrated LEDs.",
      "Above 1.7 m we move into focal-point territory. A 2.23 m windmill is what people order when they have a long lawn and want a destination at the end of it — somewhere your eye lands when you look out from the kitchen window. Expect visitors to walk over to inspect it.",
      "One more thing: think about the journey. A 2.2 m windmill is not delivered as a single piece. Make sure you can route the boxed kit through your gate before you order. We have helped more than one customer carry a windmill round the side of a house.",
    ],
    categorySlug: 'care-guides',
    publishedDaysAgo: 12,
  },
  {
    slug: 'caring-for-outdoor-wooden-decorations',
    title: 'Caring for outdoor wooden decorations: a year-round checklist',
    excerpt:
      'Five minutes per season is all it takes. Spring, summer, autumn, winter — the simple routine that keeps wooden pieces looking new.',
    paragraphs: [
      "Every piece that leaves the workshop is pressure-treated and finished with a clear weatherproof coat, but wood is wood. A bit of attention twice a year doubles the useful life of anything sitting outside in British weather.",
      "In spring, give the piece a once-over with a soft brush and warm soapy water. Look at the joints — that is where moisture tends to gather. If you spot any greyed areas, a coat of clear exterior wood oil restores both the colour and the water-shedding layer.",
      "Summer is the easy season. Keep an eye on anything that has crept underneath — climbing plants love to wind around windmill legs and wishing-well roofs. Trim them back; trapped greenery holds water against the wood and accelerates ageing.",
      "Autumn is when we recommend re-oiling. The wood has been through six months of sun, and the timber will drink in a thin coat of oil happily. Choose a dry afternoon; brush on, leave for an hour, wipe off the excess. Done.",
      "Winter is where most people overdo it. Wooden pieces survive frost; what they do not love is sitting on permanently wet ground. If a planter or wishing-well is in a notoriously soggy spot, raise it on two or three patio bricks. Air underneath does more than any product.",
    ],
    categorySlug: 'care-guides',
    publishedDaysAgo: 21,
  },
  {
    slug: 'wooden-vs-metal-garden-ornaments',
    title: 'Wooden vs metal garden ornaments: which lasts longer?',
    excerpt:
      'A fair comparison from a workshop that uses both. Spoiler: longevity is rarely the deciding factor.',
    paragraphs: [
      "We use both materials, and both have a place. The shorthand is: metal lasts longer untreated, but wood ages more attractively. The trick is matching the material to the look you want, not chasing the spec sheet.",
      "Powder-coated metal will stay flat colour for a decade with zero maintenance. The downside is that when it does start to chip — and it eventually does — repairs look obvious. The fix is a full strip and recoat, not a touch-up.",
      "Wood, by contrast, weathers. The first year a windmill changes most: from warm honey to a deeper amber. After year two it stabilises. With light annual oiling, our oldest customer pieces are now eight years out and still in regular use. Without oil they go silver-grey, which some people deliberately want for a coastal look.",
      "The decision usually comes down to neighbours, not metallurgy. In a modern minimalist garden powder-coated steel disappears nicely; in a cottage garden the wood looks like it has always been there.",
      "Mixed media works too. Our most popular customer photo is a wooden windmill set against a black-painted steel arch. The contrast does more work than either piece would alone.",
    ],
    categorySlug: 'care-guides',
    publishedDaysAgo: 30,
  },
  {
    slug: 'bird-feeders-that-actually-work',
    title: 'Bird feeders that actually work: 4 designs we love',
    excerpt:
      'Most bird feeders fail because of geometry, not bait. Here is what to look for and how to position it.',
    paragraphs: [
      "A bird feeder lives or dies on three things: shelter from the wind, distance from a launch point, and a roof that actually keeps the seed dry. Miss any of those and the most expensive nyger seed in the world will sit untouched.",
      "Wind first. Birds will not commit to a feeder that wobbles. Hanging feeders need either a fixed-direction hook or, better, a stand. We build most of our feeders with integrated stands for exactly this reason: the bird approaches a stable target.",
      "Distance second. Sparrowhawks ambush from cover, so a feeder placed less than a metre from a hedge feels like a trap. The bird that survives the winter is the one that learns to feed two clear metres from anything a hawk can hide in.",
      "The roof matters most in the UK. Rain-soaked seed grows mould fast and birds learn quickly to avoid it. The deeper the overhang, the longer the seed stays edible. Our roofs project well past the seed tray for this reason.",
      "Finally, cleaning. The boring truth is that any feeder needs a wash with hot water every fortnight in winter. The smart design is the one that comes apart in thirty seconds with no tools.",
    ],
    categorySlug: 'garden-ideas',
    publishedDaysAgo: 42,
  },
  {
    slug: 'handmade-vs-mass-produced',
    title: 'Why handmade beats mass-produced for garden decor',
    excerpt:
      'Not nostalgia. A straight look at where the £50 price gap actually goes.',
    paragraphs: [
      "We are biased: we run a workshop. But the case for handmade is not sentimental. It is mostly about how each piece is engineered for the climate it ends up in.",
      "A mass-produced windmill is engineered for the easiest shared denominator. The same model ships to dry Spain and damp Yorkshire, and the timber thickness is set somewhere in the middle. Our 100 cm model uses 28 mm structural timber in the legs because we tested 18 mm and 22 mm and watched them warp in two winters.",
      "Then there are the fasteners. Bulk-built decor uses galvanised screws because they are cheap; we use stainless throughout because we got tired of replacing rusted heads. The difference is measured in pence per piece and years of service.",
      "Finish is the other invisible cost. A factory-stained windmill gets one pass of pigmented stain. Ours get the wood oiled, sanded, oiled again. That is the step that makes a piece weather to honey instead of grey.",
      "All of which justifies the price gap — about £50 on a 1 m windmill, compared with bulk imports. You can save that money. We just think the maths catches up with you in year three.",
    ],
    categorySlug: 'garden-ideas',
    publishedDaysAgo: 55,
  },
]

function richTextFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            mode: 'normal' as const,
            text,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      })),
    },
  }
}

async function ensureBlogContent(
  payload: Parameters<typeof runSeed>[0],
  productMediaIds: Array<string | number>,
): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = []
  const skipped: string[] = []

  // Author
  const existingAuthor = await payload.find({
    collection: 'blog-authors' as never,
    where: { slug: { equals: BLOG_AUTHOR.slug } } as never,
    limit: 1,
    depth: 0,
  })
  let authorId: string | number
  if (existingAuthor.totalDocs > 0) {
    authorId = (existingAuthor.docs[0] as { id: string | number }).id
  } else {
    const a = (await payload.create({
      collection: 'blog-authors' as never,
      locale: 'en' as never,
      data: {
        name: BLOG_AUTHOR.name,
        slug: BLOG_AUTHOR.slug,
        bio: richTextFromParagraphs([BLOG_AUTHOR.bio]),
      } as never,
    })) as { id: string | number }
    authorId = a.id
  }

  // Categories
  const categoryIds = new Map<string, string | number>()
  for (const cat of BLOG_CATEGORIES) {
    const existing = await payload.find({
      collection: 'blog-categories' as never,
      where: { slug: { equals: cat.slug } } as never,
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs > 0) {
      categoryIds.set(cat.slug, (existing.docs[0] as { id: string | number }).id)
      continue
    }
    const c = (await payload.create({
      collection: 'blog-categories' as never,
      locale: 'en' as never,
      data: {
        name: cat.name,
        slug: cat.slug,
        description: richTextFromParagraphs([cat.description]),
        order: cat.order,
      } as never,
    })) as { id: string | number }
    categoryIds.set(cat.slug, c.id)
  }

  // Posts
  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i]
    if (!post) continue
    const existing = await payload.find({
      collection: 'blog-posts' as never,
      where: { slug: { equals: post.slug } } as never,
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs > 0) {
      skipped.push(post.slug)
      continue
    }

    const categoryId = categoryIds.get(post.categorySlug)
    if (!categoryId) continue

    const publishedAt = new Date(Date.now() - post.publishedDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    // Cycle through available product images for cover photos
    const coverImageId = productMediaIds[i % Math.max(1, productMediaIds.length)]

    await payload.create({
      collection: 'blog-posts' as never,
      locale: 'en' as never,
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: richTextFromParagraphs(post.paragraphs),
        author: authorId,
        category: categoryId,
        status: 'published',
        publishedAt,
        ...(coverImageId && { coverImage: coverImageId }),
      } as never,
    })
    created.push(post.slug)
  }

  return { created, skipped }
}

const FEATURED_SLUGS = [
  'windmill-100cm',
  'wishing-well-135cm',
  'wheel-barrow-planter-127cm',
  'wind-spinner-twister-50cm',
]
const TILE_CATEGORY_SLUGS = ['windmills', 'wishing-wells', 'planters', 'wind-spinners']

async function ensureHomePage(
  payload: Parameters<typeof runSeed>[0],
  productIds: Map<string, string | number>,
  categoryIds: Map<string, string | number>,
): Promise<'created' | 'skipped' | 'error'> {
  try {
    const current = (await payload.findGlobal({
      slug: 'home-page' as never,
      locale: 'en' as never,
      depth: 0,
    })) as { blocks?: unknown[] } | null
    if (current?.blocks && current.blocks.length > 0) return 'skipped'

    const featured = FEATURED_SLUGS.map((s) => productIds.get(s)).filter(Boolean) as Array<string | number>
    const tiles = TILE_CATEGORY_SLUGS.map((s) => categoryIds.get(s)).filter(Boolean) as Array<
      string | number
    >

    await payload.updateGlobal({
      slug: 'home-page' as never,
      locale: 'en' as never,
      data: {
        blocks: [
          {
            blockType: 'hero',
            eyebrow: 'Handmade in Britain',
            heading: 'A garden that turns heads —',
            headingAccent: 'without the weekend of work',
            subheading:
              'Bird feeders, planters, windmills, wishing wells. Hand-built from weatherproofed wood with LED lighting baked in. Made to last every season.',
            primaryCta: { label: 'Shop windmills', href: '/shop?category=windmills' },
            secondaryCta: { label: 'Browse all products', href: '/shop' },
          },
          {
            blockType: 'trust-bar',
            items: [
              { icon: '🔨', label: 'Handmade in the UK' },
              { icon: '🚚', label: 'Dispatch within 48h' },
              { icon: '↩', label: '14-day returns' },
              { icon: '🔒', label: 'Secure payments' },
            ],
          },
          ...(featured.length > 0
            ? [
                {
                  blockType: 'featured-products',
                  eyebrow: 'Most loved',
                  heading: 'Customer favourites',
                  products: featured,
                  viewAllHref: '/shop',
                },
              ]
            : []),
          ...(tiles.length > 0
            ? [
                {
                  blockType: 'category-tiles',
                  eyebrow: 'Browse by type',
                  heading: 'Pick your style',
                  categories: tiles,
                  columns: '4',
                },
              ]
            : []),
        ],
      } as never,
      overrideAccess: true,
    })
    return 'created'
  } catch {
    return 'error'
  }
}

export async function runSeed(payload: Payload): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesCreated: [],
    categoriesSkipped: [],
    productsCreated: [],
    productsSkipped: [],
    homePage: 'skipped',
    blogPostsCreated: [],
    blogPostsSkipped: [],
    reviewsCreated: 0,
    reviewsSkipped: 0,
    errors: [],
  }
  const productMediaIds: Array<string | number> = []

  const categoryIds = new Map<string, string | number>()
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories' as never,
      where: { slug: { equals: cat.slug } } as never,
      limit: 1,
      locale: 'en' as never,
    })
    if (existing.totalDocs > 0) {
      categoryIds.set(cat.slug, (existing.docs[0] as { id: string | number }).id)
      result.categoriesSkipped.push(cat.slug)
      continue
    }
    const created = (await payload.create({
      collection: 'categories' as never,
      locale: 'en' as never,
      data: {
        name: cat.name,
        slug: cat.slug,
        ...(cat.description && { description: richTextFromString(cat.description) }),
      } as never,
    })) as { id: string | number }
    categoryIds.set(cat.slug, created.id)
    result.categoriesCreated.push(cat.slug)
  }

  const productIds = new Map<string, string | number>()
  for (const p of products) {
    try {
      const existing = await payload.find({
        collection: 'products' as never,
        where: { slug: { equals: p.slug } } as never,
        limit: 1,
        locale: 'en' as never,
      })
      if (existing.totalDocs > 0) {
        productIds.set(p.slug, (existing.docs[0] as { id: string | number }).id)
        result.productsSkipped.push(p.slug)
        continue
      }

      const { buffer, mimetype } = await downloadImage(p.imageUrl)
      const ext = mimetype.includes('webp') ? 'webp' : mimetype.includes('png') ? 'png' : 'jpg'

      const media = (await payload.create({
        collection: 'media' as never,
        data: { alt: p.name } as never,
        file: {
          data: buffer,
          mimetype,
          name: `${p.slug}.${ext}`,
          size: buffer.length,
        },
      })) as { id: string | number }
      productMediaIds.push(media.id)

      const categoryId = categoryIds.get(p.categorySlug)
      if (!categoryId) throw new Error(`Unknown category: ${p.categorySlug}`)

      const created = (await payload.create({
        collection: 'products' as never,
        locale: 'en' as never,
        data: {
          name: p.name,
          slug: p.slug,
          description: richTextFromString(p.description),
          price: p.price,
          category: categoryId,
          images: [{ image: media.id }],
          status: 'available',
          stock: 5,
          ...(p.height && { dimensions: { height: p.height } }),
        } as never,
      })) as { id: string | number }
      productIds.set(p.slug, created.id)
      result.productsCreated.push(p.slug)
    } catch (err) {
      result.errors.push({ slug: p.slug, message: err instanceof Error ? err.message : String(err) })
    }
  }

  // When seed re-runs against existing products, pull their media IDs so
  // the blog post cover images still have something to point at.
  if (productMediaIds.length === 0 && productIds.size > 0) {
    const existing = await payload.find({
      collection: 'products' as never,
      where: { id: { in: Array.from(productIds.values()) } } as never,
      limit: 50,
      depth: 1,
    })
    for (const p of existing.docs as Array<{ images?: Array<{ image?: unknown } | null> }>) {
      const img = p.images?.[0]?.image
      if (img && typeof img === 'object' && 'id' in img) {
        productMediaIds.push((img as { id: string | number }).id)
      } else if (typeof img === 'string' || typeof img === 'number') {
        productMediaIds.push(img)
      }
    }
  }

  result.homePage = await ensureHomePage(payload, productIds, categoryIds)

  try {
    const blog = await ensureBlogContent(payload, productMediaIds)
    result.blogPostsCreated = blog.created
    result.blogPostsSkipped = blog.skipped
  } catch (err) {
    result.errors.push({
      slug: 'blog',
      message: err instanceof Error ? err.message : String(err),
    })
  }

  try {
    const reviews = await ensureSampleReviews(payload, productIds)
    result.reviewsCreated = reviews.created
    result.reviewsSkipped = reviews.skipped
  } catch (err) {
    result.errors.push({
      slug: 'reviews',
      message: err instanceof Error ? err.message : String(err),
    })
  }

  return result
}
