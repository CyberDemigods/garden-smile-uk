'use client'

import { useSyncExternalStore, useCallback } from 'react'

export interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
}

const WISHLIST_KEY = 'demicommerce-wishlist'

function getFromStorage(): WishlistStore {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const stored = localStorage.getItem(WISHLIST_KEY)
    return stored ? (JSON.parse(stored) as WishlistStore) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function save(state: WishlistStore) {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('wishlist-updated'))
}

function subscribe(listener: () => void) {
  const handler = () => listener()
  window.addEventListener('wishlist-updated', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('wishlist-updated', handler)
    window.removeEventListener('storage', handler)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return JSON.stringify({ items: [] })
  return localStorage.getItem(WISHLIST_KEY) || JSON.stringify({ items: [] })
}

function getServerSnapshot(): string {
  return JSON.stringify({ items: [] })
}

export function useWishlist() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state: WishlistStore = JSON.parse(value) as WishlistStore

  const addItem = useCallback((product: Omit<WishlistItem, 'addedAt'>) => {
    const current = getFromStorage()
    if (current.items.some((it) => it.id === product.id)) return
    current.items.push({ ...product, addedAt: new Date().toISOString() })
    save(current)
  }, [])

  const removeItem = useCallback((productId: string) => {
    const current = getFromStorage()
    current.items = current.items.filter((it) => it.id !== productId)
    save(current)
  }, [])

  const toggleItem = useCallback((product: Omit<WishlistItem, 'addedAt'>) => {
    const current = getFromStorage()
    const existing = current.items.find((it) => it.id === product.id)
    if (existing) {
      current.items = current.items.filter((it) => it.id !== product.id)
    } else {
      current.items.push({ ...product, addedAt: new Date().toISOString() })
    }
    save(current)
  }, [])

  const clear = useCallback(() => {
    save({ items: [] })
  }, [])

  const has = useCallback(
    (productId: string) => state.items.some((it) => it.id === productId),
    [state.items],
  )

  return {
    items: state.items,
    totalItems: state.items.length,
    addItem,
    removeItem,
    toggleItem,
    has,
    clear,
  }
}
