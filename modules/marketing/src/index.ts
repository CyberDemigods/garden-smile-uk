import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'

export interface MarketingModuleOptions {
  /** Add the Marketing tab to shop-settings. Default: true */
  extendShopSettings?: boolean
}

/**
 * Wires marketing-tracking config (GTM, GA4, Google Ads, Meta Pixel) into the
 * shop-settings global. The frontend pulls these IDs and injects the right
 * scripts via <MarketingScripts /> from `@demicommerce/module-marketing/scripts`.
 *
 * The module ships no pixels of its own — all wiring happens in the storefront
 * layer with real Next.js <Script> components, so consent state and CSP are
 * controlled by the application.
 */
export function marketingModule(options: MarketingModuleOptions = {}): DemiModule {
  const extendShopSettings = options.extendShopSettings ?? true

  return createModule({
    slug: 'marketing',
    name: 'Marketing',
    version: '0.1.0',
    extendGlobals: extendShopSettings
      ? {
          'shop-settings': {
            fields: [
              {
                type: 'tabs',
                tabs: [
                  {
                    label: 'Marketing',
                    description:
                      'Tracking and ads pixel configuration. IDs are loaded by the storefront on each request — change here, refresh, no redeploy.',
                    fields: [
                      {
                        name: 'gtmContainerId',
                        type: 'text',
                        label: 'Google Tag Manager container ID',
                        admin: { description: 'GTM-XXXXXXX. When set, all other tags can be managed inside GTM.' },
                      },
                      {
                        name: 'ga4MeasurementId',
                        type: 'text',
                        label: 'GA4 measurement ID',
                        admin: { description: 'G-XXXXXXXXXX. Skip if you only use GTM.' },
                      },
                      {
                        name: 'googleAdsConversionId',
                        type: 'text',
                        label: 'Google Ads conversion ID',
                        admin: {
                          description: 'AW-XXXXXXXXXX (without the slash and label).',
                        },
                      },
                      {
                        name: 'googleAdsPurchaseLabel',
                        type: 'text',
                        label: 'Google Ads purchase conversion label',
                        admin: {
                          description: 'Label after the slash, e.g. "abcDEF12_3456". Fired on order confirmation.',
                        },
                      },
                      {
                        name: 'metaPixelId',
                        type: 'text',
                        label: 'Meta (Facebook/Instagram) Pixel ID',
                        admin: { description: 'Numeric pixel ID. Fires Pageview + Purchase events.' },
                      },
                      {
                        name: 'tiktokPixelId',
                        type: 'text',
                        label: 'TikTok Pixel ID',
                      },
                      {
                        name: 'marketingRequireConsent',
                        type: 'checkbox',
                        label: 'Require cookie consent before loading marketing scripts',
                        defaultValue: true,
                        admin: {
                          description:
                            'Recommended for EU/UK GDPR compliance. The storefront should expose a consent state via the marketingConsent prop.',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
      : undefined,
  })
}

export type { MarketingConfig, PurchaseEventData } from './helpers/index.ts'
