import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import { SubscriptionPlansCollection } from './collections/SubscriptionPlans.ts'
import { SubscriptionsCollection } from './collections/Subscriptions.ts'

export interface SubscriptionsModuleOptions {
  /** Adds a Subscriptions tab to shop-settings. Default: true. */
  extendShopSettings?: boolean
}

export function subscriptionsModule(options: SubscriptionsModuleOptions = {}): DemiModule {
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'subscriptions',
    name: 'Subscriptions',
    version: '0.1.0',
    dependencies: { users: '^0.1.0' },
    collections: [SubscriptionPlansCollection, SubscriptionsCollection],
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'Subscriptions',
                    fields: [
                      {
                        name: 'subscriptionsEnabled',
                        type: 'checkbox',
                        label: 'Enable subscriptions',
                        defaultValue: true,
                        admin: {
                          description:
                            'When off, the storefront should hide pricing pages and sign-up flows.',
                        },
                      },
                      {
                        name: 'subscriptionsProvider',
                        type: 'select',
                        defaultValue: 'stripe',
                        options: [
                          { label: 'Stripe', value: 'stripe' },
                          { label: 'Manual (admin-managed)', value: 'manual' },
                        ],
                        admin: {
                          description:
                            'Stripe drives the lifecycle via webhooks. Manual is useful for offline billing (bank transfer, invoicing).',
                        },
                      },
                      {
                        name: 'subscriptionsPortalReturnPath',
                        type: 'text',
                        label: 'Customer portal return path',
                        defaultValue: '/account/subscriptions',
                        admin: {
                          description:
                            'Where to send customers after they finish managing their subscription in the Stripe Customer Portal.',
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
  })
}

export { SubscriptionPlansCollection } from './collections/SubscriptionPlans.ts'
export { SubscriptionsCollection } from './collections/Subscriptions.ts'
export {
  listActivePlans,
  getPlanBySlug,
  getUserSubscriptions,
  getActiveSubscriptionForUser,
  upsertByStripeId,
} from './helpers.ts'
export type { SubscriptionPlanLite, SubscriptionLite } from './helpers.ts'
