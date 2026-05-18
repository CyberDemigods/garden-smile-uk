import Image from 'next/image'
import Link from 'next/link'
import { CartButton } from '@/components/cart/CartButton'
import { WishlistIconButton } from '@/components/wishlist/WishlistIconButton'
import { MobileNav } from '@/components/layout/MobileNav'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgb(var(--gs-cream)/0.92)] border-b border-[rgb(var(--gs-leaf-light)/0.25)]">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <Link href="/" aria-label="Garden Smile — home" className="shrink-0">
          <Image src="/logo.svg" alt="Garden Smile" width={156} height={52} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[rgb(var(--gs-stone))]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[rgb(var(--gs-leaf))] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WishlistIconButton />
          <CartButton />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  )
}
