'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '@demicommerce/module-cart/use-cart'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalAmount, removeItem, updateQuantity, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)

  // Portal target only available after hydration.
  useEffect(() => setMounted(true), [])

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-[rgb(var(--gs-leaf-deep)/0.55)] backdrop-blur-sm z-50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-[rgb(var(--gs-cream))] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between px-6 h-20 border-b border-[rgb(var(--gs-leaf-light)/0.25)]">
          <h2 className="font-serif text-2xl text-[rgb(var(--gs-leaf-deep))]">
            Cart {totalItems > 0 && <span className="text-base text-[rgb(var(--gs-stone))]">· {totalItems}</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 rounded-full hover:bg-[rgb(var(--gs-leaf-light)/0.18)] text-[rgb(var(--gs-leaf-deep))]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[rgb(var(--gs-stone))] mb-4">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={onClose}
              className="px-5 py-3 rounded-full bg-[rgb(var(--gs-leaf))] text-white font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[rgb(var(--gs-stone)/0.5)]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={onClose}
                      className="text-sm font-medium text-[rgb(var(--gs-leaf-deep))] line-clamp-2 hover:text-[rgb(var(--gs-leaf))]"
                    >
                      {item.name}
                    </Link>
                    <span className="text-sm text-[rgb(var(--gs-stone))] mt-0.5">
                      {formatPrice(item.price)}
                    </span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 border border-[rgb(var(--gs-leaf-light)/0.4)] rounded-full">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full hover:bg-[rgb(var(--gs-leaf-light)/0.18)] text-[rgb(var(--gs-leaf-deep))]"
                        >
                          –
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full hover:bg-[rgb(var(--gs-leaf-light)/0.18)] text-[rgb(var(--gs-leaf-deep))]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[rgb(var(--gs-stone)/0.7)] hover:text-[rgb(var(--gs-leaf-deep))] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="px-6 py-5 border-t border-[rgb(var(--gs-leaf-light)/0.25)] space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-[rgb(var(--gs-stone))]">Subtotal</span>
                <span className="text-2xl font-medium text-[rgb(var(--gs-leaf-deep))]">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--gs-stone)/0.6)]">
                Shipping calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full px-6 py-4 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-center font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition"
              >
                Go to checkout
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="block w-full text-xs text-[rgb(var(--gs-stone)/0.7)] hover:text-[rgb(var(--gs-leaf-deep))] underline"
              >
                Clear cart
              </button>
            </footer>
          </>
        )}
      </aside>
    </>,
    document.body,
  )
}
