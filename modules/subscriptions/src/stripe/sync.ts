import type { Payload, PayloadRequest } from 'payload'
import type {
  StripeInvoiceLike,
  StripeSubscriptionLike,
  StripeSubscriptionStatus,
  StripeWebhookEvent,
} from './types.ts'

type PayloadLike = Payload | PayloadRequest['payload']

const STATUS_MAP: Record<StripeSubscriptionStatus, string> = {
  incomplete: 'incomplete',
  incomplete_expired: 'canceled',
  trialing: 'trialing',
  active: 'active',
  past_due: 'past_due',
  canceled: 'canceled',
  unpaid: 'unpaid',
  paused: 'paused',
}

function tsToIso(unix: number | null | undefined): string | undefined {
  if (!unix) return undefined
  return new Date(unix * 1000).toISOString()
}

async function findUserByStripeCustomer(
  payload: PayloadLike,
  customerId: string,
): Promise<string | number | null> {
  // Subscriptions table is the canonical link customerId -> userId.
  const result = await payload.find({
    collection: 'subscriptions' as never,
    where: { stripeCustomerId: { equals: customerId } } as never,
    limit: 1,
    depth: 0,
  })
  if (result.totalDocs === 0) return null
  const doc = result.docs[0] as { user?: { id?: string | number } | string | number }
  if (!doc.user) return null
  return typeof doc.user === 'object' && doc.user !== null && 'id' in doc.user
    ? (doc.user.id as string | number)
    : (doc.user as string | number)
}

async function findPlanByStripePriceId(
  payload: PayloadLike,
  priceId: string,
): Promise<string | number | null> {
  const result = await payload.find({
    collection: 'subscription-plans' as never,
    where: { stripePriceId: { equals: priceId } } as never,
    limit: 1,
    depth: 0,
  })
  if (result.totalDocs === 0) return null
  return (result.docs[0] as { id: string | number }).id
}

async function syncSubscription(
  payload: PayloadLike,
  sub: StripeSubscriptionLike,
): Promise<void> {
  const priceId = sub.items?.data?.[0]?.price?.id
  const planId = priceId ? await findPlanByStripePriceId(payload, priceId) : null

  // metadata.userId is the trusted way to associate the subscription on first creation.
  const userIdFromMetadata = sub.metadata?.userId
  const userIdLookup =
    userIdFromMetadata ?? (await findUserByStripeCustomer(payload, sub.customer))

  const data: Record<string, unknown> = {
    status: STATUS_MAP[sub.status] ?? 'incomplete',
    stripeCustomerId: sub.customer,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodStart: tsToIso(sub.current_period_start),
    currentPeriodEnd: tsToIso(sub.current_period_end),
    canceledAt: tsToIso(sub.canceled_at),
    metadata: sub.metadata ?? {},
    provider: 'stripe',
  }
  if (planId) data.plan = planId
  if (userIdLookup) data.user = userIdLookup

  // Upsert by stripe id.
  const existing = await payload.find({
    collection: 'subscriptions' as never,
    where: { stripeSubscriptionId: { equals: sub.id } } as never,
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    const id = (existing.docs[0] as { id: string | number }).id
    await payload.update({
      collection: 'subscriptions' as never,
      id: id as never,
      data: data as never,
      overrideAccess: true,
    })
  } else {
    if (!data.user || !data.plan) {
      // Cannot meaningfully create without a user+plan link; skip and let next event reconcile.
      return
    }
    await payload.create({
      collection: 'subscriptions' as never,
      data: { ...data, stripeSubscriptionId: sub.id } as never,
      overrideAccess: true,
    })
  }
}

async function syncInvoice(
  payload: PayloadLike,
  invoice: StripeInvoiceLike,
  failed: boolean,
): Promise<void> {
  if (!invoice.subscription) return

  const existing = await payload.find({
    collection: 'subscriptions' as never,
    where: { stripeSubscriptionId: { equals: invoice.subscription } } as never,
    limit: 1,
    depth: 0,
  })
  if (existing.totalDocs === 0) return

  const id = (existing.docs[0] as { id: string | number }).id
  await payload.update({
    collection: 'subscriptions' as never,
    id: id as never,
    data: {
      lastInvoiceStatus: failed ? 'failed' : (invoice.status ?? 'paid'),
      lastInvoiceAt: tsToIso(invoice.created) ?? new Date().toISOString(),
    } as never,
    overrideAccess: true,
  })
}

/**
 * Apply a verified Stripe webhook event to the local subscriptions cache.
 * Pure function over the Payload data layer — does not call Stripe API.
 *
 * Returns true when the event was handled, false otherwise (unknown event types
 * are intentionally ignored so apps can pass any Stripe event without filtering).
 */
export async function syncFromStripeEvent(
  payload: PayloadLike,
  event: StripeWebhookEvent,
): Promise<boolean> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await syncSubscription(payload, event.data.object as StripeSubscriptionLike)
      return true
    }
    case 'invoice.paid': {
      await syncInvoice(payload, event.data.object as StripeInvoiceLike, false)
      return true
    }
    case 'invoice.payment_failed': {
      await syncInvoice(payload, event.data.object as StripeInvoiceLike, true)
      return true
    }
    default:
      return false
  }
}
