'use client'

import { useWishlist } from '@/context/WishlistContext'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ChevronRight, Heart } from 'lucide-react'

export default function FavoritosPage() {
  const { items } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
              <p className="text-gray-600 mb-6">
                Tienes {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''} en favoritos
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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
