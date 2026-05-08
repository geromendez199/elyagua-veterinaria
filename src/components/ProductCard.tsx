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
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
      <div className="p-3 md:p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
            {product.categoria}
          </span>
          <h3 className="font-bold text-sm md:text-lg text-gray-800 mt-1 leading-tight line-clamp-2">{product.nombre}</h3>
        </div>
        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-1 hidden md:block">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-base md:text-2xl font-bold text-primary">
              ${product.precio.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`text-white p-2 rounded-lg transition shrink-0 ${
              justAdded
                ? 'bg-green-500'
                : 'bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
