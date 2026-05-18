import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'Contact' }

export default async function ContactPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'contact')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="The Contact page is being prepared. Set the content in admin → Pages → contact."
      />
    </section>
  )
}
