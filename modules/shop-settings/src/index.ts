import { createModule } from '@demicommerce/core'
import type { DemiModule } from '@demicommerce/core'
import type { Tab } from 'payload'
import { createShopSettingsGlobal } from './globals/ShopSettings.ts'

export interface ShopSettingsModuleOptions {
  /** Additional tabs to add to shop settings */
  extraTabs?: Tab[]
  /** Currency options */
  currencies?: Array<{ label: string; value: string }>
  /** Default currency code */
  defaultCurrency?: string
}

export function shopSettingsModule(options?: ShopSettingsModuleOptions): DemiModule {
  return createModule({
    slug: 'shop-settings',
    name: 'Shop Settings',
    version: '0.1.0',
    dependencies: { media: '^0.1.0' },
    globals: [
      createShopSettingsGlobal({
        extraTabs: options?.extraTabs,
        currencies: options?.currencies,
        defaultCurrency: options?.defaultCurrency,
      }),
    ],
  })
}
