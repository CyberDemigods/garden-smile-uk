export interface PaymentProvider {
  /** Unique identifier for this provider (e.g. "hotpay", "stripe") */
  slug: string

  /** Human-readable name */
  name: string

  /** Create a payment session and return a redirect URL */
  createSession(params: CreatePaymentParams): Promise<PaymentSession>

  /** Verify a payment notification/webhook */
  verifyNotification(payload: unknown): Promise<PaymentVerification>
}

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  returnUrl: string
  notificationUrl: string
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
}
