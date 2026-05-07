'use client'

import { Product } from '@/types'
import { ShoppingCart, Check } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 h-full flex flex-col border-l-4 border-primary">
      <div className="aspect-square bg-gradient-to-br from-primary-light to-primary-dark relative overflow-hidden">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-800 flex-1">{product.nombre}</h3>
          <span className="text-xs bg-primary text-white px-3 py-1 rounded-full whitespace-nowrap ml-2 font-semibold">
            {product.categoria}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-3xl font-bold text-primary">
              ${product.precio.toFixed(2)}
            </p>
            <p className="text-xs text-primary-dark font-semibold">
              {product.stock > 0 ? `${product.stock} en stock` : '❌ Sin stock'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`text-white p-3 rounded-lg transition shadow-lg ${
              justAdded
                ? 'bg-green-500'
                : 'bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {justAdded ? <Check size={22} /> : <ShoppingCart size={22} />}
          </button>
        </div>
      </div>
    </div>
  )
}
