'use client'

import { Product } from '@/types'
import { ShoppingCart, Check, Share2, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useState } from 'react'
import { formatPrice } from '@/lib/formatPrice'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

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
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-gray-200" fill="currentColor">
                <ellipse cx="50" cy="65" rx="22" ry="18"/>
                <circle cx="27" cy="38" r="11"/>
                <circle cx="73" cy="38" r="11"/>
                <circle cx="18" cy="57" r="9"/>
                <circle cx="82" cy="57" r="9"/>
              </svg>
            </div>
          )}
          {/* Presentación badge en esquina inferior derecha */}
          {product.presentacion && (
            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
              <p className="text-xs font-semibold text-primary">
                {product.presentacion}
              </p>
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
          {product.laboratorio && (
            <div className="mb-3 hidden md:block">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-600">Laboratorio:</span> {product.laboratorio}
              </p>
            </div>
          )}
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
