'use client'

import { useCart } from '@demicommerce/module-cart/use-cart'

interface AddToCartButtonProps {
  productId: string | number
  name: string
  slug: string
  price: number
  image?: string | null
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function AddToCartButton({
  productId,
  name,
  slug,
  price,
  image,
  disabled,
  className,
  children,
}: AddToCartButtonProps) {
  const { addItem } = useCart()

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem({
          id: String(productId),
          name,
          slug,
          price,
          image: image ?? null,
        })
        // CartButton listens for this and pops the drawer open.
        window.dispatchEvent(new Event('cart-open'))
      }}
      className={
        className ??
        'flex-1 min-w-[200px] px-6 py-4 rounded-full bg-[rgb(var(--gs-leaf))] text-white font-medium hover:bg-[rgb(var(--gs-leaf-deep))] transition disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {children ?? 'Add to cart'}
    </button>
  )
}
