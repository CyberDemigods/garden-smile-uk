import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'Returns' }

export default async function ReturnsPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'returns')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="Returns policy is being prepared. Set the content in admin → Pages → returns."
      />
    </section>
  )
}
