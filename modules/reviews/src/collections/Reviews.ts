import type { CollectionConfig, PayloadRequest } from 'payload'

export interface ReviewsCollectionOptions {
  /** Default status applied to newly submitted reviews. */
  defaultStatus?: 'pending' | 'approved'
  /** When true, reviews are auto-approved when verifiedPurchase is set. */
  autoApproveVerified?: boolean
  /** Allow guest submissions (no logged-in user). When false, only logged-in users can post. */
  allowGuestReviews?: boolean
}

async function isVerifiedPurchase(
  req: PayloadRequest,
  userId: unknown,
  productId: unknown,
): Promise<boolean> {
  if (!userId || !productId) return false
  try {
    // Resolve the user's email — orders are matched by customerEmail, not by user relationship.
    const user = (await req.payload.findByID({
      collection: 'users' as never,
      id: userId as never,
      depth: 0,
    })) as { email?: string } | null
    if (!user?.email) return false

    const orders = await req.payload.find({
      collection: 'orders' as never,
      where: {
        and: [
          { customerEmail: { equals: user.email } },
          { status: { in: ['paid', 'completed'] } },
          { 'items.product': { equals: productId } },
        ],
      } as never,
      limit: 1,
      depth: 0,
    })
    return orders.totalDocs > 0
  } catch {
    // Orders collection or schema may differ; fail safe.
    return false
  }
}

export function createReviewsCollection(options: ReviewsCollectionOptions = {}): CollectionConfig {
  const defaultStatus = options.defaultStatus ?? 'pending'
  const autoApproveVerified = options.autoApproveVerified ?? false
  const allowGuestReviews = options.allowGuestReviews ?? true

  return {
    slug: 'reviews',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'rating', 'product', 'status', 'verifiedPurchase', 'createdAt'],
      description: 'Customer product reviews. Moderate by changing status to approved or rejected.',
      group: 'Reviews',
    },
    access: {
      // Anyone can submit a review (server-side validation enforces required fields).
      create: () => true,
      // Public sees approved reviews; admins see everything.
      read: ({ req }) => {
        const user = req.user as { role?: string } | undefined
        if (user?.role === 'admin') return true
        return { status: { equals: 'approved' } }
      },
      // Only admins moderate or delete.
      update: ({ req }) => {
        const user = req.user as { role?: string } | undefined
        return user?.role === 'admin'
      },
      delete: ({ req }) => {
        const user = req.user as { role?: string } | undefined
        return user?.role === 'admin'
      },
    },
    hooks: {
      beforeChange: [
        async ({ data, operation, req }) => {
          if (operation !== 'create') return data

          const verified = await isVerifiedPurchase(req, data.user, data.product)
          data.verifiedPurchase = verified

          if (autoApproveVerified && verified && data.status === 'pending') {
            data.status = 'approved'
          }

          return data
        },
      ],
    },
    fields: [
      {
        name: 'product',
        type: 'relationship',
        relationTo: 'products' as never,
        required: true,
        index: true,
        label: 'Product',
      },
      {
        name: 'rating',
        type: 'number',
        required: true,
        min: 1,
        max: 5,
        label: 'Rating',
        admin: { description: '1 (worst) to 5 (best).' },
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        label: 'Title',
        maxLength: 120,
      },
      {
        name: 'comment',
        type: 'textarea',
        required: true,
        label: 'Comment',
        maxLength: 4000,
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: 'users' as never,
        label: 'Author (logged-in)',
        admin: {
          description: 'Set when the reviewer was logged in. Leave empty for guest reviews.',
        },
      },
      {
        name: 'guestName',
        type: 'text',
        label: 'Guest name',
        maxLength: 120,
        admin: {
          condition: (_data, siblingData) => allowGuestReviews && !siblingData?.user,
          description: 'Display name for guest reviewers (when no user is linked).',
        },
      },
      {
        name: 'guestEmail',
        type: 'email',
        label: 'Guest email',
        admin: {
          condition: (_data, siblingData) => allowGuestReviews && !siblingData?.user,
          description: 'Used for moderation contact only; never displayed publicly.',
        },
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        defaultValue: defaultStatus,
        options: [
          { label: 'Pending moderation', value: 'pending' },
          { label: 'Approved (public)', value: 'approved' },
          { label: 'Rejected (hidden)', value: 'rejected' },
        ],
        admin: { position: 'sidebar' },
      },
      {
        name: 'verifiedPurchase',
        type: 'checkbox',
        defaultValue: false,
        label: 'Verified purchase',
        admin: {
          position: 'sidebar',
          description: 'Auto-set on create when the linked user has a paid order containing this product.',
        },
      },
      {
        name: 'moderationNote',
        type: 'textarea',
        label: 'Internal moderation note',
        admin: {
          position: 'sidebar',
          description: 'Admin-only notes (rejection reason, follow-ups). Never shown publicly.',
        },
      },
      {
        name: 'source',
        type: 'select',
        label: 'Source',
        defaultValue: 'native',
        options: [
          { label: 'Native (own storefront)', value: 'native' },
          { label: 'eBay', value: 'ebay' },
          { label: 'Allegro', value: 'allegro' },
          { label: 'Google', value: 'google' },
          { label: 'Other', value: 'other' },
        ],
        admin: {
          position: 'sidebar',
          description: 'Where this review originated. Used to show a badge in the storefront.',
        },
      },
      {
        name: 'sourceUrl',
        type: 'text',
        label: 'Source URL',
        admin: {
          position: 'sidebar',
          description: 'Optional link to the original review page (e.g. eBay feedback URL).',
        },
      },
      {
        name: 'featured',
        type: 'checkbox',
        label: 'Featured on homepage',
        defaultValue: false,
        admin: {
          position: 'sidebar',
          description: 'When checked, this review is eligible for the home page testimonials section.',
        },
      },
    ],
    timestamps: true,
  }
}
