'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Product } from '@/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, quantity)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (product.stock === 0) {
    return (
      <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed text-lg">
        Sin stock
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-600">Cantidad:</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 hover:bg-gray-100 transition text-gray-700"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 hover:bg-gray-100 transition text-gray-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Botón agregar */}
      <button
        onClick={handleAdd}
        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-xl transition text-lg ${
          justAdded
            ? 'bg-green-500 text-white'
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {justAdded ? <Check size={22} /> : <ShoppingCart size={22} />}
        {justAdded ? '¡Agregado al carrito!' : 'Agregar al carrito'}
      </button>
    </div>
  )
}
