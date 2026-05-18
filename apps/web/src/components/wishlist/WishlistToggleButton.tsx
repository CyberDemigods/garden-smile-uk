'use client'

import { useWishlist } from '@demicommerce/module-wishlist/use-wishlist'

interface WishlistToggleButtonProps {
  productId: string | number
  name: string
  slug: string
  price: number
  image?: string | null
  className?: string
}

export function WishlistToggleButton({
  productId,
  name,
  slug,
  price,
  image,
  className,
}: WishlistToggleButtonProps) {
  const { has, toggleItem } = useWishlist()
  const id = String(productId)
  const inList = has(id)

  return (
    <button
      type="button"
      onClick={() =>
        toggleItem({
          id,
          name,
          slug,
          price,
          image: image ?? null,
        })
      }
      aria-label={inList ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inList}
      className={
        className ??
        `px-5 py-4 rounded-full border-2 border-[rgb(var(--gs-leaf))] transition ${
          inList
            ? 'bg-[rgb(var(--gs-leaf))] text-white hover:bg-[rgb(var(--gs-leaf-deep))]'
            : 'text-[rgb(var(--gs-leaf))] hover:bg-[rgb(var(--gs-leaf-light)/0.12)]'
        }`
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={inList ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
    </button>
  )
}
