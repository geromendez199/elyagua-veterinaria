'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase-browser'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const STORAGE_KEY = 'elyagua-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const supabase = createClient()

  // Cargar carrito desde localStorage + cloud sync
  useEffect(() => {
    const initCart = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setItems(JSON.parse(saved))
      } catch {}
      setHydrated(true)
    }
    initCart()
  }, [])

  // Guardar en localStorage + sync a cloud
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        ;(async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('carts').upsert(
              {
                user_id: user.id,
                items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            )
          }
        })()
      } catch {}
    }
  }, [items, hydrated, supabase])

  const addItem = (product: Product, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock)
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        )
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => setItems([])

  const total = items.reduce(
    (sum, item) => sum + item.product.precio * item.quantity,
    0
  )

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
