import type { Payload } from 'payload'
import type { CmsPage } from '@/components/cms/CmsPageRenderer'

export async function getPageBySlug(payload: Payload, slug: string): Promise<CmsPage | null> {
  const result = await payload.find({
    collection: 'pages' as never,
    where: { slug: { equals: slug } } as never,
    limit: 1,
    depth: 0,
    locale: 'en' as never,
  })
  if (result.totalDocs === 0) return null
  const doc = result.docs[0] as { title?: string; content?: unknown }
  return { title: doc.title, content: doc.content }
}
