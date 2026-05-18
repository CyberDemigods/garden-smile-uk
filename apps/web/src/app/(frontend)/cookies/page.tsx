import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'Cookies' }

export default async function CookiesPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'cookies')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="Cookies policy is being prepared. Set the content in admin → Pages → cookies."
      />
    </section>
  )
}
