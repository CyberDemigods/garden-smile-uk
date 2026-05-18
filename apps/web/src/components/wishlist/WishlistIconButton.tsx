'use client'

import Link from 'next/link'
import { useWishlist } from '@demicommerce/module-wishlist/use-wishlist'

export function WishlistIconButton() {
  const { totalItems } = useWishlist()

  return (
    <Link
      href="/wishlist"
      aria-label={totalItems > 0 ? `Wishlist (${totalItems} items)` : 'Wishlist'}
      className="relative p-2 rounded-full hover:bg-[rgb(var(--gs-leaf-light)/0.18)] transition-colors text-[rgb(var(--gs-leaf-deep))]"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-[10px] font-medium flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
