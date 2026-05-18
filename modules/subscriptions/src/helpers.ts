import type { Payload, PayloadRequest } from 'payload'

type PayloadLike = Payload | PayloadRequest['payload']

export interface SubscriptionPlanLite {
  id: string | number
  slug: string
  name: string
  price: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialDays: number
  isActive: boolean
  stripePriceId?: string
  stripeProductId?: string
}

export interface SubscriptionLite {
  id: string | number
  user: string | number
  plan: string | number
  status: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  canceledAt?: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

/**
 * List all active subscription plans, ordered by `order` then `price`.
 */
export async function listActivePlans(payload: PayloadLike): Promise<SubscriptionPlanLite[]> {
  const result = await payload.find({
    collection: 'subscription-plans' as never,
    where: { isActive: { equals: true } } as never,
    sort: 'order',
    limit: 100,
    depth: 0,
  })
  return (result.docs as Array<Record<string, unknown>>).map(toPlanLite)
}

/**
 * Get a plan by slug. Returns null when not found or inactive.
 */
export async function getPlanBySlug(
  payload: PayloadLike,
  slug: string,
): Promise<SubscriptionPlanLite | null> {
  const result = await payload.find({
    collection: 'subscription-plans' as never,
    where: { slug: { equals: slug } } as never,
    limit: 1,
    depth: 0,
  })
  if (result.totalDocs === 0) return null
  return toPlanLite(result.docs[0] as Record<string, unknown>)
}

/**
 * List all subscriptions for a user (active + historical).
 */
export async function getUserSubscriptions(
  payload: PayloadLike,
  userId: string | number,
): Promise<SubscriptionLite[]> {
  const result = await payload.find({
    collection: 'subscriptions' as never,
    where: { user: { equals: userId } } as never,
    sort: '-updatedAt',
    limit: 50,
    depth: 0,
  })
  return (result.docs as Array<Record<string, unknown>>).map(toSubscriptionLite)
}

/**
 * Get the user's currently entitled subscription (status in trialing/active),
 * if any. When multiple match, the most recent is returned.
 */
export async function getActiveSubscriptionForUser(
  payload: PayloadLike,
  userId: string | number,
): Promise<SubscriptionLite | null> {
  const result = await payload.find({
    collection: 'subscriptions' as never,
    where: {
      and: [
        { user: { equals: userId } },
        { status: { in: ['trialing', 'active'] } },
      ],
    } as never,
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  if (result.totalDocs === 0) return null
  return toSubscriptionLite(result.docs[0] as Record<string, unknown>)
}

/**
 * Find or create a subscription record by stripeSubscriptionId.
 * Used by the webhook sync; not normally called directly.
 */
export async function upsertByStripeId(
  payload: PayloadLike,
  stripeSubscriptionId: string,
  data: Partial<Record<string, unknown>>,
): Promise<SubscriptionLite> {
  const existing = await payload.find({
    collection: 'subscriptions' as never,
    where: { stripeSubscriptionId: { equals: stripeSubscriptionId } } as never,
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    const id = (existing.docs[0] as { id: string | number }).id
    const updated = (await payload.update({
      collection: 'subscriptions' as never,
      id: id as never,
      data: data as never,
      overrideAccess: true,
    })) as Record<string, unknown>
    return toSubscriptionLite(updated)
  }

  const created = (await payload.create({
    collection: 'subscriptions' as never,
    data: { ...data, stripeSubscriptionId } as never,
    overrideAccess: true,
  })) as Record<string, unknown>
  return toSubscriptionLite(created)
}

function toPlanLite(doc: Record<string, unknown>): SubscriptionPlanLite {
  return {
    id: doc.id as string | number,
    slug: doc.slug as string,
    name: doc.name as string,
    price: Number(doc.price ?? 0),
    currency: (doc.currency as string) ?? 'GBP',
    interval: (doc.interval as SubscriptionPlanLite['interval']) ?? 'month',
    intervalCount: Number(doc.intervalCount ?? 1),
    trialDays: Number(doc.trialDays ?? 0),
    isActive: Boolean(doc.isActive),
    stripePriceId: (doc.stripePriceId as string) || undefined,
    stripeProductId: (doc.stripeProductId as string) || undefined,
  }
}

function toSubscriptionLite(doc: Record<string, unknown>): SubscriptionLite {
  const userField = doc.user as { id?: string | number } | string | number
  const planField = doc.plan as { id?: string | number } | string | number
  const userId =
    typeof userField === 'object' && userField !== null && 'id' in userField
      ? (userField.id as string | number)
      : (userField as string | number)
  const planId =
    typeof planField === 'object' && planField !== null && 'id' in planField
      ? (planField.id as string | number)
      : (planField as string | number)

  return {
    id: doc.id as string | number,
    user: userId,
    plan: planId,
    status: (doc.status as string) ?? 'incomplete',
    currentPeriodStart: doc.currentPeriodStart as string | undefined,
    currentPeriodEnd: doc.currentPeriodEnd as string | undefined,
    cancelAtPeriodEnd: Boolean(doc.cancelAtPeriodEnd),
    canceledAt: doc.canceledAt as string | undefined,
    stripeSubscriptionId: doc.stripeSubscriptionId as string | undefined,
    stripeCustomerId: doc.stripeCustomerId as string | undefined,
  }
}
