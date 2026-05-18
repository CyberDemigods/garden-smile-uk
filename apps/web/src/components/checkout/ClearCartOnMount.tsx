'use client'

import { useEffect } from 'react'
import { useCart } from '@demicommerce/module-cart/use-cart'

/** Empty the local cart once the order confirmation page is shown. */
export function ClearCartOnMount() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
  }, [clearCart])
  return null
}
