/**
 * Abstract payment provider interface.
 * Implement this to add a new payment gateway (HotPay, Stripe, PayU, etc.)
 */
export interface PaymentProvider {
  /** Unique identifier for this provider (e.g. 'stripe', 'paypal'). */
  slug: string
  /** Human-readable name (e.g. 'Stripe', 'PayPal'). */
  name: string
  /** Whether the provider has all required environment variables set. */
  isConfigured?(): boolean

  /**
   * Initiate a payment session and return a URL to redirect the customer to.
   */
  createSession(params: CreatePaymentParams): Promise<PaymentSession>

  /**
   * Verify an incoming webhook/notification from the payment gateway.
   * For some gateways the raw HTTP request is required (signature verification).
   */
  verifyNotification(payload: unknown, request?: Request): Promise<PaymentVerification>
}

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  returnUrl: string
  /** Optional separate URL for cancelled / abandoned payment. */
  cancelUrl?: string
  notificationUrl: string
  /** Optional metadata persisted with the gateway session. */
  metadata?: Record<string, string>
}

export interface PaymentSession {
  id: string
  redirectUrl: string
  provider: string
}

export interface PaymentVerification {
  success: boolean
  orderId: string
  transactionId?: string
  amount?: number
  /** Status as reported by the gateway, normalised. */
  status?: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  /** Raw event/payload for debugging or extra processing. */
  raw?: unknown
}
