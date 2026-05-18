'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWishlist } from '@demicommerce/module-wishlist/use-wishlist'
import { useCart } from '@demicommerce/module-cart/use-cart'

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

export function WishlistView() {
  const { items, removeItem, clear, totalItems } = useWishlist()
  const { addItem } = useCart()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  if (!hydrated) {
    return <div className="h-64 bg-white/40 rounded-2xl animate-pulse" />
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[rgb(var(--gs-stone))] mb-6">Your wishlist is empty.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-full bg-[rgb(var(--gs-leaf))] text-white font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
        >
          Browse the shop
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-sm text-[rgb(var(--gs-stone))]">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-[rgb(var(--gs-stone)/0.7)] hover:text-[rgb(var(--gs-leaf-deep))] underline"
        >
          Clear all
        </button>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col bg-white/60 rounded-2xl overflow-hidden border border-[rgb(var(--gs-leaf-light)/0.18)]"
          >
            <Link
              href={`/product/${item.slug}`}
              className="aspect-square relative bg-[rgb(var(--gs-cream))] overflow-hidden"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-[rgb(var(--gs-stone)/0.4)]">
                  No image
                </div>
              )}
            </Link>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <Link
                href={`/product/${item.slug}`}
                className="font-serif text-lg text-[rgb(var(--gs-leaf-deep))] hover:text-[rgb(var(--gs-leaf))] line-clamp-2"
              >
                {item.name}
              </Link>
              <span className="text-lg font-medium text-[rgb(var(--gs-leaf-deep))]">
                {formatPrice(item.price)}
              </span>
              <div className="flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      image: item.image ?? null,
                    })
                    window.dispatchEvent(new Event('cart-open'))
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-sm font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="px-4 py-2 rounded-full border border-[rgb(var(--gs-leaf-light)/0.5)] text-[rgb(var(--gs-stone))] text-sm hover:bg-[rgb(var(--gs-leaf-light)/0.12)] transition"
                  aria-label="Remove from wishlist"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
