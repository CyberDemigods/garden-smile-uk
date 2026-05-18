import Image from 'next/image'
import Link from 'next/link'
import type { BlogPostLite } from '@/lib/blog'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))

export function BlogPostCard({ post, featured }: { post: BlogPostLite; featured?: boolean }) {
  return (
    <article
      className={`group flex flex-col bg-white/60 hover:bg-white rounded-2xl overflow-hidden border border-[rgb(var(--gs-leaf-light)/0.18)] hover:border-[rgb(var(--gs-leaf-light)/0.4)] transition-all hover:shadow-lg ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`relative ${featured ? 'aspect-[16/9]' : 'aspect-[4/3]'} bg-[rgb(var(--gs-cream))] overflow-hidden`}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--gs-leaf-light)/0.4)] to-[rgb(var(--gs-leaf-deep)/0.4)]" />
        )}
      </Link>
      <div className="p-5 flex flex-col gap-2 flex-1">
        {post.category && (
          <span className="text-xs uppercase tracking-wider text-[rgb(var(--gs-leaf))] font-medium">
            {post.category.name}
          </span>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h3
            className={`font-serif leading-tight ${featured ? 'text-2xl md:text-3xl' : 'text-xl'} hover:text-[rgb(var(--gs-leaf))] transition-colors line-clamp-2`}
          >
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-[rgb(var(--gs-stone))] line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-[rgb(var(--gs-stone)/0.7)] mt-auto pt-3">
          {post.author && <span>{post.author.name}</span>}
          {post.publishedAt && <span>· {formatDate(post.publishedAt)}</span>}
          {post.readingTimeMinutes && <span>· {post.readingTimeMinutes} min read</span>}
        </div>
      </div>
    </article>
  )
}
