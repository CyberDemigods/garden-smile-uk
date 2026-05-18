import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { assembleShop } from '@demicommerce/core'
import { mediaModule } from '@demicommerce/module-media'
import { usersModule } from '@demicommerce/module-users'
import { productsModule } from '@demicommerce/module-products'
import { shopSettingsModule } from '@demicommerce/module-shop-settings'
import { ordersModule } from '@demicommerce/module-orders'
import { cartModule } from '@demicommerce/module-cart'
import { wishlistModule } from '@demicommerce/module-wishlist'
import { checkoutModule } from '@demicommerce/module-checkout'
import { paymentsModule, stripeProvider, paypalProvider } from '@demicommerce/module-payments'
import { cmsModule } from '@demicommerce/module-cms'
import { faqModule } from '@demicommerce/module-faq'
import { blogModule } from '@demicommerce/module-blog'
import { themesModule } from '@demicommerce/module-themes'
import { seasonsModule } from '@demicommerce/module-seasons'
import { analyticsModule } from '@demicommerce/module-analytics'
import { receiptsModule } from '@demicommerce/module-receipts'
import { marketingModule } from '@demicommerce/module-marketing'
import { reviewsModule } from '@demicommerce/module-reviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | Garden Smile UK' },
  },
  collections: [],
  globals: [],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    push: true,
  }),
  sharp,
  plugins: [
    assembleShop({
      modules: [
        // --- Core ---
        mediaModule(),
        usersModule({
          roles: [{ label: 'Admin', value: 'admin' }],
          defaultRole: 'admin',
        }),

        // --- Catalog ---
        productsModule({ enablePriceHistory: true, enableDimensions: true }),

        // --- Shop config: GBP, VAT 20% (toggle off until £90k threshold) ---
        shopSettingsModule({
          defaultCurrency: 'GBP',
          currencies: [
            { label: 'GBP (£)', value: 'GBP' },
            { label: 'EUR (€)', value: 'EUR' },
          ],
        }),
        ordersModule({
          onCreated: [
            async (data) => {
              console.log(`[garden-smile-uk] New order: ${data.orderNumber}`)
            },
          ],
        }),
        cartModule(),
        wishlistModule(),

        // --- Payments: Stripe + PayPal (no HotPay outside PL) ---
        paymentsModule({
          providers: [
            stripeProvider({
              secretKey: process.env.STRIPE_SECRET_KEY ?? '',
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
            }),
            paypalProvider({
              clientId: process.env.PAYPAL_CLIENT_ID ?? '',
              clientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
              webhookId: process.env.PAYPAL_WEBHOOK_ID ?? '',
              environment:
                (process.env.PAYPAL_ENV as 'sandbox' | 'live' | undefined) ?? 'sandbox',
            }),
          ],
        }),
        checkoutModule(),

        // --- Content ---
        cmsModule(),
        faqModule(),
        blogModule(),

        // --- Theming + seasonal collections (Spring/Summer/Autumn/Winter) ---
        themesModule(),
        seasonsModule(),

        // --- Analytics: UK VAT registration threshold ---
        analyticsModule({
          taxThresholds: [{ label: 'UK VAT registration threshold', limit: 90000 }],
        }),

        // --- Receipts: UK invoices auto-issued on paid orders ---
        receiptsModule({ defaultTemplate: 'uk-invoice' }),

        // --- Marketing tracking (GTM/GA4/Google Ads/Meta Pixel) ---
        marketingModule(),

        // --- Customer reviews (manual import from eBay + native submissions) ---
        reviewsModule({ defaultStatus: 'approved', allowGuestReviews: true }),
      ],
    }),
  ],
})
