import { createHash } from 'crypto'
import type { PaymentProvider, CreatePaymentParams, PaymentSession, PaymentVerification } from '../types.ts'

const HOTPAY_URL = 'https://platnosc.hotpay.pl/'

export interface HotPayConfig {
  secret: string
  notificationPassword: string
}

interface HotPayNotification {
  KWOTA: string
  ID_PLATNOSCI: string
  ID_ZAMOWIENIA: string
  STATUS: string
  SECURE: string
  HASH: string
  [key: string]: string
}

function calculateRegisterHash(
  config: HotPayConfig,
  params: { amount: string; serviceName: string; returnUrl: string; orderId: string },
): string {
  const input = [
    config.notificationPassword,
    params.amount,
    params.serviceName,
    params.returnUrl,
    params.orderId,
    config.secret,
  ].join(';')
  return createHash('sha256').update(input).digest('hex')
}

function calculateNotificationHash(
  config: HotPayConfig,
  params: { amount: string; paymentId: string; orderId: string; status: string; secure: string },
): string {
  const input = [
    config.notificationPassword,
    params.amount,
    params.paymentId,
    params.orderId,
    params.status,
    params.secure,
    config.secret,
  ].join(';')
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Create a HotPay payment provider instance.
 *
 * @example
 * ```ts
 * paymentsModule({
 *   providers: [
 *     hotpayProvider({
 *       secret: process.env.HOTPAY_SECRET!,
 *       notificationPassword: process.env.HOTPAY_NOTIFICATION_PASSWORD!,
 *     }),
 *   ],
 * })
 * ```
 */
export function hotpayProvider(config: HotPayConfig): PaymentProvider {
  return {
    slug: 'hotpay',
    name: 'HotPay',

    async createSession(params: CreatePaymentParams): Promise<PaymentSession> {
      const amount = params.amount.toFixed(2)

      const hash = calculateRegisterHash(config, {
        amount,
        serviceName: params.description,
        returnUrl: params.returnUrl,
        orderId: params.orderId,
      })

      const form = new FormData()
      form.append('SEKRET', config.secret)
      form.append('KWOTA', amount)
      form.append('NAZWA_USLUGI', params.description)
      form.append('ADRES_WWW', params.returnUrl)
      form.append('ID_ZAMOWIENIA', params.orderId)
      form.append('TYP', 'INIT')
      form.append('HASH', hash)
      if (params.customerEmail) form.append('EMAIL', params.customerEmail)

      const res = await fetch(HOTPAY_URL, { method: 'POST', body: form })
      const data = (await res.json()) as { STATUS?: boolean; URL?: string; WIADOMOSC?: string }

      if (!data.STATUS) {
        throw new Error(`HotPay register failed: ${data.WIADOMOSC || 'Unknown error'}`)
      }

      return {
        id: params.orderId,
        redirectUrl: data.URL!,
        provider: 'hotpay',
      }
    },

    async verifyNotification(payload: unknown): Promise<PaymentVerification> {
      const notification = payload as HotPayNotification

      const expectedHash = calculateNotificationHash(config, {
        amount: notification.KWOTA,
        paymentId: notification.ID_PLATNOSCI,
        orderId: notification.ID_ZAMOWIENIA,
        status: notification.STATUS,
        secure: notification.SECURE,
      })

      if (notification.HASH !== expectedHash) {
        return { success: false, orderId: notification.ID_ZAMOWIENIA }
      }

      return {
        success: notification.STATUS === 'SUCCESS',
        orderId: notification.ID_ZAMOWIENIA,
        transactionId: notification.ID_PLATNOSCI,
        amount: parseFloat(notification.KWOTA),
      }
    },
  }
}
