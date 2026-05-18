import type { RichTextBlockData } from '@demicommerce/module-cms'
import { lexicalToParagraphs } from '@/lib/lexical'

const WIDTH_CLASS: Record<NonNullable<RichTextBlockData['maxWidth']>, string> = {
  prose: 'max-w-2xl',
  wide: 'max-w-4xl',
  full: 'max-w-6xl',
}

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  const paragraphs = lexicalToParagraphs(block.content)
  if (paragraphs.length === 0) return null
  const width = WIDTH_CLASS[block.maxWidth ?? 'prose']

  return (
    <section className={`${width} mx-auto px-6 py-12`}>
      <div className="prose prose-stone max-w-none text-[rgb(var(--gs-stone))]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  )
}
