import Image from 'next/image'
import Link from 'next/link'

const columns = [
  {
    heading: 'Shop',
    links: [
      { href: '/shop', label: 'All products' },
      { href: '/shop?category=windmills', label: 'Windmills' },
      { href: '/shop?category=planters', label: 'Planters' },
      { href: '/shop?category=wishing-wells', label: 'Wishing wells' },
      { href: '/shop?category=spinners', label: 'Wind spinners' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' },
      { href: '/shipping', label: 'Shipping' },
      { href: '/returns', label: 'Returns' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/blog', label: 'Blog' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms & conditions' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[rgb(var(--gs-leaf-deep))] text-[rgb(var(--gs-cream))] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <Image
            src="/logo.svg"
            alt="Garden Smile"
            width={156}
            height={52}
            className="brightness-0 invert"
          />
          <p className="text-sm text-[rgb(var(--gs-cream)/0.75)] max-w-xs leading-relaxed">
            Handcrafted wood and metal pieces that keep your garden smiling all year round.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="font-serif text-lg mb-4 text-[rgb(var(--gs-cream))]">{col.heading}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[rgb(var(--gs-cream)/0.7)] hover:text-[rgb(var(--gs-leaf-light))] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[rgb(var(--gs-cream)/0.12)]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs">
          <span className="text-[rgb(var(--gs-cream)/0.55)]">
            © {new Date().getFullYear()} Garden Smile. All rights reserved.
          </span>
          <span className="uppercase tracking-widest text-[rgb(var(--gs-cream)/0.45)]">
            Forged by{' '}
            <a
              href="https://cyberdemigods.com"
              target="_blank"
              rel="noopener"
              className="hover:text-[rgb(var(--gs-leaf-light))] transition-colors"
            >
              CyberDemigods
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
