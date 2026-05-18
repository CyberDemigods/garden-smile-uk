import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'Shipping' }

export default async function ShippingPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'shipping')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="Shipping information is being prepared. Set the content in admin → Pages → shipping."
      />
    </section>
  )
}
