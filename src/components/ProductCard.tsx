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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col">
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 flex-1">{product.nombre}</h3>
          <span className="text-xs bg-primary text-white px-2 py-1 rounded whitespace-nowrap ml-2">
            {product.categoria}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-2xl font-bold text-primary">
              ${product.precio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`text-white p-2 rounded-lg transition ${
              justAdded
                ? 'bg-green-500'
                : 'bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {justAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
