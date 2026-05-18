import { lexicalToParagraphs } from '@/lib/lexical'

export interface CmsPage {
  title?: string
  content?: unknown
}

export function CmsPageRenderer({ page, fallback }: { page: CmsPage | null; fallback: string }) {
  if (!page) {
    return (
      <div className="text-center py-16 text-[rgb(var(--gs-stone))]">
        <p className="font-serif text-2xl text-[rgb(var(--gs-leaf-deep))] mb-2">Coming soon</p>
        <p className="text-sm">{fallback}</p>
      </div>
    )
  }

  const paragraphs = lexicalToParagraphs(page.content)

  return (
    <article className="prose prose-stone max-w-none">
      {page.title && (
        <h1 className="font-serif text-4xl sm:text-5xl text-[rgb(var(--gs-leaf-deep))] mb-6">
          {page.title}
        </h1>
      )}
      {paragraphs.length > 0 ? (
        paragraphs.map((p, i) => (
          <p key={i} className="text-[rgb(var(--gs-stone))]">
            {p}
          </p>
        ))
      ) : (
        <p className="text-[rgb(var(--gs-stone)/0.6)] italic">
          Content coming soon — check back shortly.
        </p>
      )}
    </article>
  )
}
