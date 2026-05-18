'use client'

import {
  MarketingScripts,
  TrackPurchaseEvent,
  type MarketingConfig,
  type PurchaseEventData,
} from '@demicommerce/module-marketing/scripts'
import { useCookieConsent } from './use-cookie-consent'

/**
 * Mounts the marketing scripts only when the user has consented to marketing
 * cookies. Used at the storefront layout level — cookie consent state lives
 * in localStorage, so this must be a client component.
 */
export function MarketingHost({ config }: { config: MarketingConfig }) {
  const { state } = useCookieConsent()
  return <MarketingScripts config={config} consentGiven={state.marketing} />
}

/**
 * Fires the purchase conversion event when consent allows it. Drop on the
 * order confirmation page exactly once.
 */
export function PurchaseTracker({
  config,
  data,
}: {
  config: MarketingConfig
  data: PurchaseEventData
}) {
  const { state } = useCookieConsent()
  return <TrackPurchaseEvent config={config} data={data} consentGiven={state.marketing} />
}
