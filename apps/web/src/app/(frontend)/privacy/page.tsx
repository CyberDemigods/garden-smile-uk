import { getPayloadClient } from '@/lib/payload'
import { getPageBySlug } from '@/lib/cms'
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer'

export const metadata = { title: 'Privacy policy' }

export default async function PrivacyPage() {
  const payload = await getPayloadClient()
  const page = await getPageBySlug(payload, 'privacy')
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <CmsPageRenderer
        page={page}
        fallback="Privacy policy is being prepared. Set the content in admin → Pages → privacy."
      />
    </section>
  )
}
