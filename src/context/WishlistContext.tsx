'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface WishlistContextType {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  count: number
  clear: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
const STORAGE_KEY = 'elyagua-wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const hydrated = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (productId: string) => {
    setItems((prev) => prev.includes(productId) ? prev : [...prev, productId])
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId))
  }

  const toggleItem = (productId: string) => {
    if (isInWishlist(productId)) removeItem(productId)
    else addItem(productId)
  }

  const isInWishlist = (productId: string) => items.includes(productId)

  const clear = () => setItems([])

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist, count: items.length, clear }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) throw new Error('useWishlist debe usarse dentro de WishlistProvider')
  return context
}
