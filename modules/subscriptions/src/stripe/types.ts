/**
 * Subset of Stripe webhook event shape used by syncFromStripeEvent.
 * Apps pass already-verified events from `stripe.webhooks.constructEvent(...)`;
 * we only declare the fields we read so the module does not need the Stripe SDK.
 */

export type StripeSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'

export interface StripeSubscriptionLike {
  id: string
  customer: string
  status: StripeSubscriptionStatus
  current_period_start?: number
  current_period_end?: number
  cancel_at_period_end?: boolean
  canceled_at?: number | null
  trial_end?: number | null
  metadata?: Record<string, string>
  items?: {
    data?: Array<{
      price?: {
        id?: string
        product?: string
      }
    }>
  }
}

export interface StripeInvoiceLike {
  id: string
  customer: string
  subscription?: string | null
  status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  paid?: boolean
  amount_paid?: number
  currency?: string
  created?: number
}

export type StripeWebhookEvent =
  | { type: 'customer.subscription.created'; data: { object: StripeSubscriptionLike } }
  | { type: 'customer.subscription.updated'; data: { object: StripeSubscriptionLike } }
  | { type: 'customer.subscription.deleted'; data: { object: StripeSubscriptionLike } }
  | { type: 'invoice.paid'; data: { object: StripeInvoiceLike } }
  | { type: 'invoice.payment_failed'; data: { object: StripeInvoiceLike } }
  | { type: string; data: { object: unknown } }
