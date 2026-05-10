'use client'

import { Product } from '@/types'
import { ShoppingCart, Check, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import { formatPrice } from '@/lib/formatPrice'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `https://elyagua-veterinaria.vercel.app/productos/${product.id}`
    const text = `🐾 *${product.nombre}*\n${formatPrice(product.precio)}\n\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <Link href={`/productos/${product.id}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col group">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.imagen_url ? (
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-3 group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}
          {/* Botón compartir — siempre visible en mobile, hover en desktop */}
          <button
            onClick={handleShare}
            title="Compartir por WhatsApp"
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-primary hover:text-white text-gray-500 shadow"
          >
            <Share2 size={14} />
          </button>
        </div>

        <div className="p-3 md:p-5 flex flex-col flex-1">
          <div className="mb-2">
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded capitalize">
              {product.categoria}
            </span>
            <h3 className="font-bold text-sm md:text-base text-gray-800 mt-1 leading-tight line-clamp-2">
              {product.nombre}
            </h3>
          </div>
          <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-1 hidden md:block">
            {product.descripcion}
          </p>
          <div className="flex justify-between items-end mt-auto gap-2">
            <div>
              <p className="text-base md:text-xl font-bold text-primary">
                {formatPrice(product.precio)}
              </p>
              <p className={`text-xs font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                {product.stock === 0 ? 'Sin stock' : product.stock < 5 ? `¡Últimas ${product.stock}!` : `${product.stock} en stock`}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex items-center gap-1.5 text-white px-3 py-2 rounded-lg transition shrink-0 font-semibold text-sm ${
                justAdded
                  ? 'bg-green-500'
                  : 'bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
              <span className="hidden sm:inline">
                {justAdded ? 'Agregado' : product.stock === 0 ? 'Sin stock' : 'Agregar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
