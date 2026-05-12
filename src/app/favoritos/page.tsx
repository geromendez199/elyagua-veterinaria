'use client'

import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ChevronRight, Heart, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/formatPrice'

export default function FavoritosPage() {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('productos')
        .select('*')
        .in('id', items)
        .eq('activo', true)

      setProducts(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [items])

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary transition">
            Inicio
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Favoritos</span>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="text-red-500" fill="currentColor" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Mis Favoritos
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
              <Heart className="mx-auto mb-4 text-gray-300" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aún no tienes favoritos
              </h2>
              <p className="text-gray-500 mb-6">
                Explora nuestros productos y agrega tus favoritos para verlos después
              </p>
              <Link
                href="/productos"
                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition"
              >
                Ver Productos
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Tienes {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''} en favoritos
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      view === 'grid'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      view === 'list'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>

              {view === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {products.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`p-4 md:p-6 flex items-center gap-4 md:gap-6 ${
                        idx < products.length - 1 ? 'border-b border-gray-100' : ''
                      } hover:bg-gray-50 transition`}
                    >
                      {/* Imagen */}
                      {product.imagen_url && (
                        <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={product.imagen_url}
                            alt={product.nombre}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/productos/${product.id}`}
                          className="block text-sm md:text-base font-semibold text-gray-900 hover:text-primary transition truncate mb-1"
                        >
                          {product.nombre}
                        </Link>
                        <p className="text-xs md:text-sm text-gray-500 capitalize mb-2">
                          {product.categoria}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg md:text-xl font-bold text-primary">
                            {formatPrice(product.precio)}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                              En stock
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {product.stock > 0 && (
                          <button
                            onClick={() => addItem(product, 1)}
                            className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                            title="Agregar al carrito"
                          >
                            <ShoppingCart size={14} />
                            <span className="hidden sm:inline">Añadir</span>
                          </button>
                        )}
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-400 hover:text-red-500 transition font-medium text-sm"
                          title="Remover de favoritos"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/productos"
              className="inline-block border-2 border-primary text-primary font-bold py-3 px-8 rounded-xl hover:bg-primary hover:text-white transition"
            >
              ← Ver todos los productos
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
