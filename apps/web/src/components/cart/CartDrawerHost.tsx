'use client'

import { useEffect, useState } from 'react'
import { CartDrawer } from './CartDrawer'

/**
 * Mounts the cart drawer at the layout root, outside any element that
 * could create a containing block for fixed children (e.g. the header's
 * backdrop-blur). Other components open the drawer by dispatching a
 * `cart-open` window event.
 */
export function CartDrawerHost() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onClose = () => setOpen(false)
    window.addEventListener('cart-open', onOpen)
    window.addEventListener('cart-close', onClose)
    return () => {
      window.removeEventListener('cart-open', onOpen)
      window.removeEventListener('cart-close', onClose)
    }
  }, [])

  return <CartDrawer open={open} onClose={() => setOpen(false)} />
}
