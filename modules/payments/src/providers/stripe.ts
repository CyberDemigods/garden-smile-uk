import Stripe from 'stripe'
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentSession,
  PaymentVerification,
} from '../types.ts'

export interface StripeConfig {
  /** sk_test_... or sk_live_... */
  secretKey: string
  /** whsec_... — used to verify webhook signatures */
  webhookSecret: string
  /** Stripe API version string (e.g. '2025-09-30.clover'). Pinned for stability. */
  apiVersion?: string
  /**
   * Optional list of payment_method_types passed to Checkout Session.
   * Default lets Stripe Dashboard control available methods (`automatic_payment_methods`).
   */
  paymentMethodTypes?: string[]
}

/**
 * Stripe Checkout provider — opens hosted Stripe Checkout session,
 * supports Cards, Apple Pay, Google Pay, Klarna BNPL natively.
 *
 * Webhook events handled in `verifyNotification`:
 *   checkout.session.completed → status: paid
 *   checkout.session.async_payment_succeeded → status: paid
 *   checkout.session.async_payment_failed → status: failed
 *   checkout.session.expired → status: cancelled
 *   charge.refunded → status: refunded
 *
 * @example
 * stripeProvider({
 *   secretKey: process.env.STRIPE_SECRET_KEY!,
 *   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
 * })
 */
export function stripeProvider(config: StripeConfig): PaymentProvider {
  const apiVersion = config.apiVersion ?? '2025-09-30.clover'
  // Lazy client — only instantiated when actually used. Allows the provider to
  // exist (registered, listed in admin) even when the secret is empty.
  let _client: Stripe | null = null
  function client(): Stripe {
    if (!_client) {
      if (!config.secretKey) {
        throw new Error('[stripe] secretKey is not configured. Set STRIPE_SECRET_KEY in .env.')
      }
      _client = new Stripe(config.secretKey, { apiVersion } as Record<string, unknown>)
    }
    return _client
  }

  return {
    slug: 'stripe',
    name: 'Stripe',

    isConfigured() {
      return Boolean(config.secretKey && config.webhookSecret)
    },

    async createSession(params: CreatePaymentParams): Promise<PaymentSession> {
      const stripe = client()

      // Stripe expects integer minor units (e.g. 19.99 GBP -> 1999).
      const unitAmount = Math.round(params.amount * 100)

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: { name: params.description },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        customer_email: params.customerEmail || undefined,
        success_url: params.returnUrl,
        cancel_url: params.cancelUrl ?? params.returnUrl,
        client_reference_id: params.orderId,
        metadata: { orderId: params.orderId, ...params.metadata },
        ...(config.paymentMethodTypes
          ? { payment_method_types: config.paymentMethodTypes as Stripe.Checkout.SessionCreateParams['payment_method_types'] }
          : { automatic_payment_methods: { enabled: true } }),
      })

      if (!session.url) {
        throw new Error('[stripe] Checkout session created but no URL returned.')
      }

      return {
        id: session.id,
        redirectUrl: session.url,
        provider: 'stripe',
      }
    },

    async verifyNotification(_payload, request): Promise<PaymentVerification> {
      if (!request) {
        return { success: false, orderId: '' }
      }
      const stripe = client()
      const sig = request.headers.get('stripe-signature') ?? ''
      const rawBody = await request.text()

      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, config.webhookSecret)
      } catch (error) {
        console.error('[stripe] webhook signature verification failed:', error)
        return { success: false, orderId: '' }
      }

      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object as Stripe.Checkout.Session
          return {
            success: session.payment_status === 'paid',
            orderId: (session.metadata?.orderId as string) || session.client_reference_id || '',
            transactionId: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
            amount: session.amount_total ? session.amount_total / 100 : undefined,
            status: 'paid',
            raw: event,
          }
        }
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object as Stripe.Checkout.Session
          return {
            success: false,
            orderId: (session.metadata?.orderId as string) || session.client_reference_id || '',
            status: 'failed',
            raw: event,
          }
        }
        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session
          return {
            success: false,
            orderId: (session.metadata?.orderId as string) || session.client_reference_id || '',
            status: 'cancelled',
            raw: event,
          }
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge
          return {
            success: true,
            orderId: (charge.metadata?.orderId as string) || '',
            transactionId: charge.id,
            amount: charge.amount_refunded / 100,
            status: 'refunded',
            raw: event,
          }
        }
        default:
          return {
            success: false,
            orderId: '',
            raw: event,
          }
      }
    },
  }
}
