import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/blog'
import { lexicalToParagraphs } from '@/lib/lexical'
import { BlogPostCard } from '@/components/blog/BlogPostCard'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const post = await getBlogPostBySlug(payload, slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const post = await getBlogPostBySlug(payload, slug)
  if (!post) notFound()

  const related = await getRelatedBlogPosts(payload, post.category?.slug, post.id, 3)
  const paragraphs = lexicalToParagraphs(post.content)

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-sm text-[rgb(var(--gs-stone))] mb-6" aria-label="Breadcrumb">
        <Link href="/blog" className="hover:text-[rgb(var(--gs-leaf))]">Blog</Link>
        {post.category && (
          <>
            <span className="mx-2 opacity-40">/</span>
            <span>{post.category.name}</span>
          </>
        )}
      </nav>

      <header className="mb-10">
        {post.category && (
          <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
            {post.category.name}
          </span>
        )}
        <h1 className="font-serif text-4xl sm:text-5xl mt-2 mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-[rgb(var(--gs-stone))]">
          {post.author && <span>{post.author.name}</span>}
          {post.publishedAt && <span>· {formatDate(post.publishedAt)}</span>}
          {post.readingTimeMinutes && <span>· {post.readingTimeMinutes} min read</span>}
        </div>
      </header>

      {post.coverImage && (
        <div className="aspect-[16/9] relative rounded-2xl overflow-hidden mb-10 shadow-xl">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-stone prose-lg max-w-none text-[rgb(var(--gs-stone))]">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p className="italic text-[rgb(var(--gs-stone)/0.6)]">Content coming soon.</p>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[rgb(var(--gs-leaf-light)/0.25)]">
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="px-3 py-1 rounded-full bg-[rgb(var(--gs-leaf-light)/0.18)] text-[rgb(var(--gs-leaf-deep))] text-xs"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl mb-6">Keep reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((p) => (
              <BlogPostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
