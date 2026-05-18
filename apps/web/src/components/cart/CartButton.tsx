'use client'

import { useCart } from '@demicommerce/module-cart/use-cart'

export function CartButton() {
  const { totalItems } = useCart()

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('cart-open'))}
      aria-label={totalItems > 0 ? `Cart (${totalItems} items)` : 'Cart'}
      className="relative p-2 rounded-full hover:bg-[rgb(var(--gs-leaf-light)/0.18)] transition-colors text-[rgb(var(--gs-leaf-deep))]"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[rgb(var(--gs-leaf))] text-white text-[10px] font-medium flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}
