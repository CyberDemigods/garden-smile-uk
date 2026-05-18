'use client'

import { useSyncExternalStore, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
}

interface CartStore {
  items: CartItem[]
}

const CART_KEY = 'demicommerce-cart'

function getCartFromStorage(): CartStore {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? (JSON.parse(stored) as CartStore) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function saveCart(cart: CartStore) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

let listeners: Array<() => void> = []

function subscribe(listener: () => void) {
  listeners.push(listener)

  const handler = () => listener()
  window.addEventListener('cart-updated', handler)
  window.addEventListener('storage', handler)

  return () => {
    listeners = listeners.filter((l) => l !== listener)
    window.removeEventListener('cart-updated', handler)
    window.removeEventListener('storage', handler)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return JSON.stringify({ items: [] })
  return localStorage.getItem(CART_KEY) || JSON.stringify({ items: [] })
}

function getServerSnapshot(): string {
  return JSON.stringify({ items: [] })
}

export function useCart() {
  const storeValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const cart: CartStore = JSON.parse(storeValue) as CartStore

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    const current = getCartFromStorage()
    const existing = current.items.find((item) => item.id === product.id)

    if (existing) {
      existing.quantity += 1
    } else {
      current.items.push({ ...product, quantity: 1 })
    }

    saveCart(current)
  }, [])

  const removeItem = useCallback((productId: string) => {
    const current = getCartFromStorage()
    current.items = current.items.filter((item) => item.id !== productId)
    saveCart(current)
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const current = getCartFromStorage()
    const item = current.items.find((i) => i.id === productId)
    if (item) {
      if (quantity <= 0) {
        current.items = current.items.filter((i) => i.id !== productId)
      } else {
        item.quantity = quantity
      }
    }
    saveCart(current)
  }, [])

  const clearCart = useCallback(() => {
    saveCart({ items: [] })
  }, [])

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return {
    items: cart.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  }
}
