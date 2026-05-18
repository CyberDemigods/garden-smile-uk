/** Shape of the marketing settings as stored on shop-settings. */
export interface MarketingConfig {
  gtmContainerId?: string
  ga4MeasurementId?: string
  googleAdsConversionId?: string
  googleAdsPurchaseLabel?: string
  metaPixelId?: string
  tiktokPixelId?: string
  marketingRequireConsent?: boolean
}

/** Order details forwarded to the conversion pixels on the order page. */
export interface PurchaseEventData {
  orderNumber: string
  totalAmount: number
  currency: string
  items: Array<{
    productId: string | number
    name: string
    price: number
    quantity: number
  }>
}

/**
 * Read marketing IDs out of the shop-settings global. Callers pull this
 * server-side and pass it to <MarketingScripts /> in the storefront layout.
 */
export function readMarketingConfig(settings: unknown): MarketingConfig {
  if (!settings || typeof settings !== 'object') return {}
  const s = settings as Record<string, unknown>
  return {
    gtmContainerId: typeof s.gtmContainerId === 'string' ? s.gtmContainerId : undefined,
    ga4MeasurementId: typeof s.ga4MeasurementId === 'string' ? s.ga4MeasurementId : undefined,
    googleAdsConversionId:
      typeof s.googleAdsConversionId === 'string' ? s.googleAdsConversionId : undefined,
    googleAdsPurchaseLabel:
      typeof s.googleAdsPurchaseLabel === 'string' ? s.googleAdsPurchaseLabel : undefined,
    metaPixelId: typeof s.metaPixelId === 'string' ? s.metaPixelId : undefined,
    tiktokPixelId: typeof s.tiktokPixelId === 'string' ? s.tiktokPixelId : undefined,
    marketingRequireConsent:
      typeof s.marketingRequireConsent === 'boolean' ? s.marketingRequireConsent : true,
  }
}
