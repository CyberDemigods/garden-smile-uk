import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { CollectionAfterChangeHook } from 'payload'
import { LoyaltyAccountsCollection } from './collections/LoyaltyAccounts.ts'
import { LoyaltyTransactionsCollection } from './collections/LoyaltyTransactions.ts'
import { awardPoints, type TierThresholds } from './helpers.ts'

export type EarnBase = 'subtotal-before-shipping' | 'grand-total'

export interface LoyaltyModuleOptions {
  /** Default points awarded per 1 currency unit spent. Overridable via shop-settings. */
  pointsPerCurrencyUnit?: number
  /** Which order amount drives the earn calculation. Default: subtotal-before-shipping. */
  earnBase?: EarnBase
  /** Default thresholds for tier calculation (lifetimeEarned). */
  tierThresholds?: TierThresholds
  /** When set, earn transactions get expiresAt = now + N months. */
  expirationMonths?: number
  /** Adds a Loyalty tab to shop-settings. Default: true. */
  extendShopSettings?: boolean
}

function makeAfterOrderChange(opts: LoyaltyModuleOptions): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return doc

    const prevStatus = (previousDoc as { status?: string } | undefined)?.status
    const currStatus = (doc as { status?: string }).status
    if (prevStatus === currStatus) return doc
    if (currStatus !== 'paid') return doc

    // Prefer per-shop overrides from shop-settings when available; fall back to module options.
    let pointsPerUnit = opts.pointsPerCurrencyUnit ?? 1
    let earnBase: EarnBase = opts.earnBase ?? 'subtotal-before-shipping'
    let tierThresholds: TierThresholds = opts.tierThresholds ?? { silver: 500, gold: 2000 }
    let expirationMonths = opts.expirationMonths
    let enabled = true

    try {
      const settings = (await req.payload.findGlobal({
        slug: 'shop-settings' as never,
        depth: 0,
      })) as Record<string, unknown>
      if (typeof settings.loyaltyEnabled === 'boolean') enabled = settings.loyaltyEnabled
      if (typeof settings.pointsPerCurrencyUnit === 'number') pointsPerUnit = settings.pointsPerCurrencyUnit
      if (typeof settings.loyaltyEarnBase === 'string') earnBase = settings.loyaltyEarnBase as EarnBase
      if (typeof settings.silverThreshold === 'number') tierThresholds.silver = settings.silverThreshold
      if (typeof settings.goldThreshold === 'number') tierThresholds.gold = settings.goldThreshold
      if (typeof settings.loyaltyExpirationMonths === 'number')
        expirationMonths = settings.loyaltyExpirationMonths
    } catch {
      // shop-settings unavailable — proceed with module defaults.
    }

    if (!enabled) return doc

    const order = doc as {
      id: string | number
      customerEmail?: string
      totalAmount?: number
      shippingCost?: number
    }

    if (!order.customerEmail) return doc

    // Resolve user by email; skip guests (no account to credit).
    const users = await req.payload.find({
      collection: 'users' as never,
      where: { email: { equals: order.customerEmail } } as never,
      limit: 1,
      depth: 0,
    })
    if (users.totalDocs === 0) return doc
    const userDoc = users.docs[0] as { id: string | number }

    const total = Number(order.totalAmount ?? 0)
    const shipping = Number(order.shippingCost ?? 0)
    const base = earnBase === 'grand-total' ? total : Math.max(0, total - shipping)
    const amount = Math.floor(base * pointsPerUnit)
    if (amount <= 0) return doc

    const expiresAt =
      expirationMonths && expirationMonths > 0
        ? new Date(Date.now() + expirationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined

    await awardPoints(req.payload, userDoc.id, {
      amount,
      reason: `Earned on order ${(doc as { orderNumber?: string }).orderNumber ?? order.id}`,
      relatedOrder: order.id,
      expiresAt,
      thresholds: tierThresholds,
    })

    return doc
  }
}

export function loyaltyModule(options: LoyaltyModuleOptions = {}): DemiModule {
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'loyalty',
    name: 'Loyalty',
    version: '0.1.0',
    dependencies: { users: '^0.1.0', orders: '^0.1.0' },
    collections: [LoyaltyAccountsCollection, LoyaltyTransactionsCollection],
    extendCollections: {
      orders: {
        hooks: {
          afterChange: [makeAfterOrderChange(options)],
        },
      },
    },
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'Loyalty',
                    fields: [
                      {
                        name: 'loyaltyEnabled',
                        type: 'checkbox',
                        label: 'Enable loyalty program',
                        defaultValue: true,
                      },
                      {
                        name: 'pointsPerCurrencyUnit',
                        type: 'number',
                        label: 'Points per 1 currency unit',
                        defaultValue: options.pointsPerCurrencyUnit ?? 1,
                        min: 0,
                        admin: {
                          step: 0.1,
                          description: 'How many points are awarded per 1 unit of the shop currency.',
                        },
                      },
                      {
                        name: 'loyaltyEarnBase',
                        type: 'select',
                        label: 'Earn base',
                        defaultValue: options.earnBase ?? 'subtotal-before-shipping',
                        options: [
                          { label: 'Subtotal before shipping', value: 'subtotal-before-shipping' },
                          { label: 'Grand total (incl. shipping)', value: 'grand-total' },
                        ],
                      },
                      {
                        name: 'silverThreshold',
                        type: 'number',
                        label: 'Silver tier threshold',
                        defaultValue: options.tierThresholds?.silver ?? 500,
                        min: 0,
                        admin: { description: 'Lifetime points needed to reach Silver.' },
                      },
                      {
                        name: 'goldThreshold',
                        type: 'number',
                        label: 'Gold tier threshold',
                        defaultValue: options.tierThresholds?.gold ?? 2000,
                        min: 0,
                        admin: { description: 'Lifetime points needed to reach Gold.' },
                      },
                      {
                        name: 'loyaltyExpirationMonths',
                        type: 'number',
                        label: 'Points expire after (months)',
                        defaultValue: options.expirationMonths ?? 0,
                        min: 0,
                        admin: { description: '0 = points never expire.' },
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

export { LoyaltyAccountsCollection } from './collections/LoyaltyAccounts.ts'
export { LoyaltyTransactionsCollection } from './collections/LoyaltyTransactions.ts'
export {
  awardPoints,
  computeTier,
  getLoyaltyAccount,
  redeemPoints,
  adjustPoints,
} from './helpers.ts'
export type {
  Tier,
  TierThresholds,
  LoyaltyAccount,
  AwardPointsArgs,
  RedeemPointsArgs,
  AdjustPointsArgs,
} from './helpers.ts'
