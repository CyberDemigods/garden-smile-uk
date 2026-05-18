import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawerHost } from '@/components/cart/CartDrawerHost'
import { CookieConsent } from '@/components/consent/CookieConsent'
import { MarketingHost } from '@/components/consent/MarketingHost'
import { FreeShippingBar } from '@/components/marketing/FreeShippingBar'
import { readMarketingConfig } from '@demicommerce/module-marketing/helpers'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const FREE_SHIPPING_THRESHOLD = 100 // GBP

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'shop-settings' as never, depth: 0 })
  const marketing = readMarketingConfig(settings)

  return (
    <>
      <FreeShippingBar threshold={FREE_SHIPPING_THRESHOLD} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawerHost />
      <CookieConsent />
      <MarketingHost config={marketing} />
    </>
  )
}
