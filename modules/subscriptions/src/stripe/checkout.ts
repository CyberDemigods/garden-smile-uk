import type { Payload, PayloadRequest } from 'payload'
import { getPlanBySlug } from '../helpers.ts'

type PayloadLike = Payload | PayloadRequest['payload']

/**
 * Minimal shape of the Stripe SDK we depend on. Apps inject their own
 * `new Stripe(secretKey, ...)` instance, which conforms to this interface.
 *
 * Why DI: keeps the module free of `stripe` as a runtime dependency and
 * agnostic of SDK versions.
 */
export interface StripeClientLike {
  checkout: {
    sessions: {
      create: (params: Record<string, unknown>) => Promise<{ id: string; url: string | null }>
    }
  }
  billingPortal: {
    sessions: {
      create: (params: Record<string, unknown>) => Promise<{ id: string; url: string }>
    }
  }
  customers: {
    create: (params: Record<string, unknown>) => Promise<{ id: string }>
  }
}

export interface CreateCheckoutSessionArgs {
  /** Plan slug or ID to subscribe to. */
  plan: string | number
  /** Authenticated user starting the checkout. */
  userId: string | number
  /** Customer email — pre-filled in Stripe Checkout. */
  userEmail: string
  /** Stripe customer ID if you have one already; otherwise a new customer is created. */
  stripeCustomerId?: string
  /** Where Stripe should redirect on success / cancel. Both must be absolute URLs. */
  successUrl: string
  cancelUrl: string
  /** Optional locale for the Stripe-hosted checkout UI. */
  locale?: string
}

/**
 * Create a Stripe Checkout Session for a subscription.
 * Returns the session URL the storefront should redirect to.
 *
 * The caller is responsible for verifying the user is authenticated; this helper
 * does not enforce auth on its own.
 */
export async function createCheckoutSession(
  stripe: StripeClientLike,
  payload: PayloadLike,
  args: CreateCheckoutSessionArgs,
): Promise<{ sessionId: string; url: string }> {
  const plan =
    typeof args.plan === 'string' && Number.isNaN(Number(args.plan))
      ? await getPlanBySlug(payload, args.plan)
      : await getPlanByIdOrSlug(payload, args.plan)
  if (!plan) throw new Error(`Subscription plan not found: ${args.plan}`)
  if (!plan.stripePriceId) {
    throw new Error(`Plan "${plan.slug}" has no stripePriceId — set it in the admin first`)
  }
  if (!plan.isActive) throw new Error(`Plan "${plan.slug}" is not active`)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    customer: args.stripeCustomerId,
    customer_email: args.stripeCustomerId ? undefined : args.userEmail,
    locale: args.locale,
    // userId travels with the subscription so we can resolve the local user
    // when the customer.subscription.created webhook arrives.
    subscription_data: {
      metadata: { userId: String(args.userId), planSlug: plan.slug },
    },
    metadata: { userId: String(args.userId), planSlug: plan.slug },
    allow_promotion_codes: true,
  })

  if (!session.url) throw new Error('Stripe did not return a checkout session URL')
  return { sessionId: session.id, url: session.url }
}

async function getPlanByIdOrSlug(payload: PayloadLike, planRef: string | number) {
  // Try ID first; if that fails, fall back to slug.
  try {
    const byId = (await payload.findByID({
      collection: 'subscription-plans' as never,
      id: planRef as never,
      depth: 0,
    })) as Record<string, unknown> | null
    if (byId) {
      return {
        id: byId.id as string | number,
        slug: byId.slug as string,
        isActive: Boolean(byId.isActive),
        stripePriceId: byId.stripePriceId as string | undefined,
      }
    }
  } catch {
    // not found by id — try slug
  }
  const bySlug = await getPlanBySlug(payload, String(planRef))
  return bySlug
}

export interface GetCustomerPortalUrlArgs {
  userId: string | number
  /** Where Stripe should send the customer after they finish managing their subscription. */
  returnUrl: string
}

/**
 * Open a Stripe Customer Portal session for a user — they can change card,
 * cancel, or resume their subscription via Stripe-hosted UI.
 *
 * Throws when the user has no Stripe customer linked yet (no subscription).
 */
export async function getCustomerPortalUrl(
  stripe: StripeClientLike,
  payload: PayloadLike,
  args: GetCustomerPortalUrlArgs,
): Promise<{ url: string }> {
  const result = await payload.find({
    collection: 'subscriptions' as never,
    where: { user: { equals: args.userId } } as never,
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  if (result.totalDocs === 0) {
    throw new Error('No subscription found for this user — cannot open Customer Portal')
  }
  const sub = result.docs[0] as { stripeCustomerId?: string }
  if (!sub.stripeCustomerId) {
    throw new Error('Subscription has no Stripe customer ID linked')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: args.returnUrl,
  })

  return { url: session.url }
}
