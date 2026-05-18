import type { Payload, PayloadRequest } from 'payload'

export type Tier = 'bronze' | 'silver' | 'gold'

export interface TierThresholds {
  /** Lifetime earned needed to reach Silver (Bronze starts at 0). */
  silver: number
  /** Lifetime earned needed to reach Gold. */
  gold: number
}

export interface LoyaltyAccount {
  id: string | number
  user: string | number
  balance: number
  lifetimeEarned: number
  tier: Tier
  joinedAt?: string
}

const DEFAULT_THRESHOLDS: TierThresholds = { silver: 500, gold: 2000 }

export function computeTier(lifetimeEarned: number, thresholds: TierThresholds = DEFAULT_THRESHOLDS): Tier {
  if (lifetimeEarned >= thresholds.gold) return 'gold'
  if (lifetimeEarned >= thresholds.silver) return 'silver'
  return 'bronze'
}

type PayloadLike = Payload | PayloadRequest['payload']

/**
 * Get-or-create a loyalty account for a user. Returns the normalised account view.
 */
export async function getLoyaltyAccount(
  payload: PayloadLike,
  userId: string | number,
): Promise<LoyaltyAccount> {
  const existing = await payload.find({
    collection: 'loyalty-accounts' as never,
    where: { user: { equals: userId } } as never,
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    const doc = existing.docs[0] as Record<string, unknown>
    return normalise(doc)
  }

  const created = (await payload.create({
    collection: 'loyalty-accounts' as never,
    data: {
      user: userId,
      balance: 0,
      lifetimeEarned: 0,
      tier: 'bronze',
      joinedAt: new Date().toISOString(),
    } as never,
    overrideAccess: true,
  })) as Record<string, unknown>

  return normalise(created)
}

function normalise(doc: Record<string, unknown>): LoyaltyAccount {
  const userField = doc.user as { id?: string | number } | string | number
  const userId =
    typeof userField === 'object' && userField !== null && 'id' in userField
      ? (userField.id as string | number)
      : (userField as string | number)
  return {
    id: doc.id as string | number,
    user: userId,
    balance: Number(doc.balance ?? 0),
    lifetimeEarned: Number(doc.lifetimeEarned ?? 0),
    tier: (doc.tier as Tier) ?? 'bronze',
    joinedAt: doc.joinedAt as string | undefined,
  }
}

export interface AwardPointsArgs {
  amount: number
  reason: string
  relatedOrder?: string | number
  expiresAt?: Date | string
  thresholds?: TierThresholds
}

/**
 * Credit points to a user. Updates the running balance, lifetimeEarned, and tier.
 * If `relatedOrder` is given, returns existing transaction (no-op) when one already
 * exists for that order — preserves idempotency from order webhooks.
 */
export async function awardPoints(
  payload: PayloadLike,
  userId: string | number,
  args: AwardPointsArgs,
): Promise<{ awarded: number; account: LoyaltyAccount; alreadyAwarded: boolean }> {
  if (args.amount <= 0) {
    const account = await getLoyaltyAccount(payload, userId)
    return { awarded: 0, account, alreadyAwarded: false }
  }

  if (args.relatedOrder) {
    const dupes = await payload.find({
      collection: 'loyalty-transactions' as never,
      where: {
        and: [
          { relatedOrder: { equals: args.relatedOrder } },
          { type: { equals: 'earn' } },
        ],
      } as never,
      limit: 1,
      depth: 0,
    })
    if (dupes.totalDocs > 0) {
      const account = await getLoyaltyAccount(payload, userId)
      return { awarded: 0, account, alreadyAwarded: true }
    }
  }

  const account = await getLoyaltyAccount(payload, userId)

  await payload.create({
    collection: 'loyalty-transactions' as never,
    data: {
      account: account.id,
      type: 'earn',
      amount: args.amount,
      reason: args.reason,
      relatedOrder: args.relatedOrder,
      expiresAt: args.expiresAt
        ? typeof args.expiresAt === 'string'
          ? args.expiresAt
          : args.expiresAt.toISOString()
        : undefined,
    } as never,
    overrideAccess: true,
  })

  const newLifetime = account.lifetimeEarned + args.amount
  const newBalance = account.balance + args.amount
  const newTier = computeTier(newLifetime, args.thresholds)

  const updated = (await payload.update({
    collection: 'loyalty-accounts' as never,
    id: account.id as never,
    data: {
      balance: newBalance,
      lifetimeEarned: newLifetime,
      tier: newTier,
    } as never,
    overrideAccess: true,
  })) as Record<string, unknown>

  return {
    awarded: args.amount,
    account: normalise(updated),
    alreadyAwarded: false,
  }
}

export interface RedeemPointsArgs {
  amount: number
  reason: string
  relatedOrder?: string | number
}

/**
 * Debit points from a user's balance. Throws when balance is insufficient.
 * lifetimeEarned is preserved (tier does not regress on redemption).
 */
export async function redeemPoints(
  payload: PayloadLike,
  userId: string | number,
  args: RedeemPointsArgs,
): Promise<{ redeemed: number; account: LoyaltyAccount }> {
  if (args.amount <= 0) {
    throw new Error('Redeem amount must be positive')
  }

  const account = await getLoyaltyAccount(payload, userId)
  if (account.balance < args.amount) {
    throw new Error(`Insufficient balance: have ${account.balance}, need ${args.amount}`)
  }

  await payload.create({
    collection: 'loyalty-transactions' as never,
    data: {
      account: account.id,
      type: 'redeem',
      amount: -args.amount,
      reason: args.reason,
      relatedOrder: args.relatedOrder,
    } as never,
    overrideAccess: true,
  })

  const updated = (await payload.update({
    collection: 'loyalty-accounts' as never,
    id: account.id as never,
    data: { balance: account.balance - args.amount } as never,
    overrideAccess: true,
  })) as Record<string, unknown>

  return { redeemed: args.amount, account: normalise(updated) }
}

export interface AdjustPointsArgs {
  amount: number
  reason: string
  thresholds?: TierThresholds
}

/**
 * Manual adjustment (positive or negative). Negative amounts can drive balance
 * below zero — caller is responsible for guarding if that matters.
 * Lifetime is bumped only on positive adjustments to avoid tier regressions.
 */
export async function adjustPoints(
  payload: PayloadLike,
  userId: string | number,
  args: AdjustPointsArgs,
): Promise<LoyaltyAccount> {
  const account = await getLoyaltyAccount(payload, userId)

  await payload.create({
    collection: 'loyalty-transactions' as never,
    data: {
      account: account.id,
      type: 'adjust',
      amount: args.amount,
      reason: args.reason,
    } as never,
    overrideAccess: true,
  })

  const newBalance = account.balance + args.amount
  const newLifetime = args.amount > 0 ? account.lifetimeEarned + args.amount : account.lifetimeEarned
  const newTier = computeTier(newLifetime, args.thresholds)

  const updated = (await payload.update({
    collection: 'loyalty-accounts' as never,
    id: account.id as never,
    data: {
      balance: newBalance,
      lifetimeEarned: newLifetime,
      tier: newTier,
    } as never,
    overrideAccess: true,
  })) as Record<string, unknown>

  return normalise(updated)
}
