import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'About us' }

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'about')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="The About page is being prepared. Set the content in admin → Pages → about."
      />
    </section>
  )
}
