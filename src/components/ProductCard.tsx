'use client'

import { Product } from '@/types'
import { ShoppingCart, Check, Share2, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useState } from 'react'
import { formatPrice } from '@/lib/formatPrice'
import { LOW_STOCK_THRESHOLD, SITE_URL } from '@/lib/constants'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const [justAdded, setJustAdded] = useState(false)
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${SITE_URL}/productos/${product.id}`
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition">
              <div className="text-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L7 21"/>
                </svg>
                <p className="text-xs text-gray-400 mt-1">Sin imagen</p>
              </div>
            </div>
          )}
          {/* Botones compartir y wishlist */}
          <div className="absolute top-2 right-2 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleItem(product.id)
              }}
              title={inWishlist ? "Remover de favoritos" : "Agregar a favoritos"}
              aria-label={inWishlist ? `Remover ${product.nombre} de favoritos` : `Agregar ${product.nombre} a favoritos`}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow ${
                inWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleShare}
              title="Compartir por WhatsApp"
              aria-label={`Compartir ${product.nombre} por WhatsApp`}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-primary hover:text-white text-gray-500 shadow transition"
            >
              <Share2 size={14} />
            </button>
          </div>
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
              <p className={`text-xs font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < LOW_STOCK_THRESHOLD ? 'text-orange-500' : 'text-gray-400'}`}>
                {product.stock === 0 ? 'Sin stock' : product.stock < LOW_STOCK_THRESHOLD ? `¡Últimas ${product.stock}!` : `${product.stock} en stock`}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={justAdded ? `${product.nombre} agregado al carrito` : product.stock === 0 ? `${product.nombre} sin stock` : `Agregar ${product.nombre} al carrito`}
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
