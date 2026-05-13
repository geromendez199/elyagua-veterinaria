'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/formatPrice'

interface ProductCarouselProps {
  products: Product[]
}

function CarouselCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <Link href={`/productos/${product.id}`} className="block h-full group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.imagen_url ? (
            <Image src={product.imagen_url} alt={product.nombre} fill className="object-contain p-3 group-hover:scale-105 transition duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : null}
          {!product.imagen_url && (
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
          <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full capitalize">
            {product.categoria}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight line-clamp-2 flex-1 mb-3">
            {product.nombre}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-lg md:text-xl font-bold text-primary">
              {formatPrice(product.precio)}
            </p>
            <button
              onClick={(e) => { e.preventDefault(); handleAdd() }}
              disabled={product.stock === 0}
              aria-label={justAdded ? `${product.nombre} agregado` : `Agregar ${product.nombre} al carrito`}
              className={`p-2 rounded-lg text-white transition ${
                justAdded ? 'bg-green-500' : 'bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [index, setIndex] = useState(0)
  const [perPage, setPerPage] = useState(3)
  const [hovered, setHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  // Detectar cuántos mostrar según ancho de pantalla
  useEffect(() => {
    const update = () => setPerPage(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, products.length - perPage)

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex])

  // Auto-avance cada 5 segundos, se pausa al hover
  useEffect(() => {
    if (products.length <= perPage || hovered) return
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [maxIndex, perPage, products.length, hovered])

  if (products.length === 0) return null

  const visible = products.slice(index, index + perPage)

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Productos destacados
          </h2>
          <Link href="/productos" className="text-primary font-semibold hover:underline text-sm md:text-base">
            Ver todos →
          </Link>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
            touchStartX.current = null
          }}
        >
          {/* Cards */}
          <div className="grid gap-4 transition-all duration-300"
            style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
          >
            {visible.map((p) => (
              <CarouselCard key={p.id} product={p} />
            ))}
          </div>

          {/* Flechas */}
          {products.length > perPage && (
            <>
              <button
                onClick={prev}
                disabled={index === 0}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 text-primary hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                disabled={index >= maxIndex}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 text-primary hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {products.length > perPage && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir a grupo ${i + 1}`}
                className="p-2 flex items-center justify-center"
              >
                <span className={`block rounded-full transition-all duration-300 ${
                  i === index ? 'bg-primary w-6 h-2' : 'bg-gray-300 w-2 h-2'
                }`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
