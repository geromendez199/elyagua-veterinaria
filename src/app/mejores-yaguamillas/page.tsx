'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Loader2, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/context/CartContext'

export default function MejoresYaguamillasPage() {
  const [productos, setProductos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .gt('puntos', 0)
          .order('puntos', { ascending: false })

        if (!error && data) {
          setProductos(data)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star size={40} className="fill-amber-300 text-amber-300" />
            <h1 className="text-3xl sm:text-4xl font-bold">Mejores YaguaMillas</h1>
          </div>
          <p className="text-primary-light text-lg max-w-2xl mx-auto">
            Descubrí los productos que te dan más YaguaMillas. Ordenados de mayor a menor para que acumules lo máximo posible.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="text-primary animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20">
            <Star size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay productos con YaguaMillas todavía</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((producto, index) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 sm:p-6 border-l-4 border-amber-400"
              >
                <div className="flex gap-4 items-start">
                  {/* Ranking */}
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-amber-600">#{index + 1}</div>
                    <div className="text-xs text-gray-400 mt-1">puesto</div>
                  </div>

                  {/* Imagen */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {producto.imagen_url ? (
                      <Image
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L7 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-2">
                      {producto.nombre}
                    </h3>
                    {producto.presentacion && (
                      <p className="text-xs text-gray-500 mb-2">
                        📦 {producto.presentacion}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="text-sm text-gray-600">
                        Precio: <span className="font-bold text-primary">{formatPrice(producto.precio)}</span>
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {producto.categoria}
                      </span>
                    </div>
                  </div>

                  {/* YaguaMillas Badge */}
                  <div className="flex-shrink-0 text-right flex items-center justify-center">
                    <div className="bg-gradient-to-br from-amber-400 to-yellow-400 rounded-2xl p-4 text-center shadow-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star size={20} className="fill-amber-600 text-amber-600" />
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-amber-900">
                        {producto.puntos}
                      </p>
                      <p className="text-xs text-amber-800 font-semibold mt-1">YaguaMillas</p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="hidden sm:flex flex-col gap-2">
                    <button
                      onClick={() => addItem(producto, 1)}
                      className="bg-primary hover:bg-primary-dark text-white p-3 rounded-lg transition"
                      title="Agregar al carrito"
                    >
                      <ShoppingCart size={20} />
                    </button>
                    <Link
                      href={`/productos?q=${encodeURIComponent(producto.nombre)}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition"
                      title="Ver detalles"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>

                {/* Mobile buttons */}
                <div className="sm:hidden mt-4 flex gap-2">
                  <button
                    onClick={() => addItem(producto, 1)}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Agregar
                  </button>
                  <Link
                    href={`/productos?q=${encodeURIComponent(producto.nombre)}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg transition text-center"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-primary/5 rounded-2xl p-8 text-center border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Empieza a acumular YaguaMillas</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Cada compra que hagas acumula YaguaMillas automáticamente. Solo necesitás ingresar tu DNI al hacer el pedido.
          </p>
          <Link
            href="/productos"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition"
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </div>
  )
}
