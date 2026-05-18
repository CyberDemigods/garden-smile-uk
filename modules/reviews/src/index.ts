import { createModule } from '@demicommerce/core'
import type { DemiModule, ModuleContext } from '@demicommerce/core'
import { createReviewsCollection } from './collections/Reviews.ts'
import type { ReviewsCollectionOptions } from './collections/Reviews.ts'

export interface ReviewsModuleOptions extends ReviewsCollectionOptions {
  /** When true, adds a Reviews tab to shop-settings with feature toggles. Default: true. */
  extendShopSettings?: boolean
}

export function reviewsModule(options: ReviewsModuleOptions = {}): DemiModule {
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'reviews',
    name: 'Reviews',
    version: '0.1.0',
    dependencies: { products: '^0.1.0', users: '^0.1.0', orders: '^0.1.0' },
    collections: [createReviewsCollection(options)],
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'Reviews',
                    fields: [
                      {
                        name: 'reviewsEnabled',
                        type: 'checkbox',
                        label: 'Enable product reviews',
                        defaultValue: true,
                        admin: {
                          description:
                            'When off, the storefront should hide review forms and listings (module collection still exists).',
                        },
                      },
                      {
                        name: 'reviewsRequireVerifiedPurchase',
                        type: 'checkbox',
                        label: 'Require verified purchase',
                        defaultValue: false,
                        admin: {
                          description:
                            'When on, only customers with a paid order for the product can submit reviews. Storefront enforces this.',
                        },
                      },
                      {
                        name: 'reviewsAllowGuests',
                        type: 'checkbox',
                        label: 'Allow guest reviews',
                        defaultValue: true,
                        admin: {
                          description:
                            'When off, only logged-in users can post reviews. Overrides per-collection allowGuestReviews from the module options.',
                        },
                      },
                      {
                        name: 'reviewsAutoApprove',
                        type: 'checkbox',
                        label: 'Auto-approve verified reviews',
                        defaultValue: false,
                        admin: {
                          description:
                            'Skip moderation for reviews from verified purchasers. Non-verified reviews still require approval.',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
      : undefined,
    onInit: (_ctx: ModuleContext) => {
      // Reserved for future seed data (e.g. demo reviews on first boot).
    },
  })
}

export { createReviewsCollection }
export type { ReviewsCollectionOptions }
