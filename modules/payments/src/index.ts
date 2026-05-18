import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { PaymentProvider } from './types.ts'

export interface PaymentsModuleOptions {
  /** Payment providers to register */
  providers: PaymentProvider[]
}

/**
 * Payment module. Registers payment providers that can be used
 * during checkout to initiate and verify payments.
 *
 * The providers are stored on the module context and can be
 * accessed by other modules (e.g. checkout).
 */
export function paymentsModule(options: PaymentsModuleOptions): DemiModule {
  const providerMap = new Map<string, PaymentProvider>(
    options.providers.map((p) => [p.slug, p]),
  )

  return createModule({
    slug: 'payments',
    name: 'Payments',
    version: '0.1.0',
    dependencies: { orders: '^0.1.0' },
    onInit: (ctx) => {
      // Store providers on the module context for other modules to access
      ;(ctx as unknown as Record<string, unknown>).paymentProviders = providerMap
      console.log(
        `[payments] Registered providers: ${options.providers.map((p) => p.name).join(', ')}`,
      )
    },
  })
}

// Re-export types and providers
export type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentSession,
  PaymentVerification,
} from './types.ts'
export { hotpayProvider, type HotPayConfig } from './providers/hotpay.ts'
export { stripeProvider, type StripeConfig } from './providers/stripe.ts'
export { paypalProvider, type PayPalConfig } from './providers/paypal.ts'
