'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente, Product } from '@/types'
import { Search, Star, TrendingUp, Calendar, Loader2, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/context/CartContext'

interface PuntosHistorial {
  id: string
  tipo: 'compra' | 'ajuste_admin' | 'canje'
  cantidad_puntos: number
  referencia?: string
  created_at: string
}

interface Cupon {
  id: string
  porcentaje_descuento: number
  usado: boolean
}

export default function MisYaguamillasPage() {
  const { addItem } = useCart()
  const [dni, setDni] = useState('')
  const [loading, setLoading] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [historial, setHistorial] = useState<PuntosHistorial[]>([])
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [productosTop, setProductosTop] = useState<Product[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [cupones, setCupones] = useState<Cupon[]>([])

  useEffect(() => {
    const fetchTopProductos = async () => {
      try {
        const { data } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .gt('puntos', 0)
          .order('puntos', { ascending: false })
          .limit(6)

        if (data) {
          setProductosTop(data)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoadingProductos(false)
      }
    }

    fetchTopProductos()
  }, [])

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    const sanitized = dni.trim().replace(/\D/g, '').slice(0, 8)

    console.log('🔍 Buscando DNI:', sanitized, 'Valor actual:', dni)

    if (sanitized.length !== 8) {
      setError('Ingresá un DNI válido (8 dígitos)')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      // Primero intenta con .single()
      let clienteData = null
      let clienteError = null

      const singleResult = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', sanitized)

      console.log('📊 Resultado de búsqueda:', singleResult)

      if (singleResult.error) {
        clienteError = singleResult.error
      } else if (singleResult.data && singleResult.data.length > 0) {
        clienteData = singleResult.data[0]
      } else {
        clienteError = { message: 'No encontrado' }
      }

      if (clienteError || !clienteData) {
        console.log('❌ Error o no encontrado:', clienteError)
        setError('No encontramos un cliente con ese DNI. ¡Hace tu primer pedido para unirte a YaguaMillas!')
        setCliente(null)
        setHistorial([])
        return
      }

      console.log('✅ Cliente encontrado:', clienteData)
      setCliente(clienteData)

      const [{ data: historialData }, { data: cuponesData }] = await Promise.all([
        supabase
          .from('historial_puntos')
          .select('*')
          .eq('cliente_id', clienteData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('cupones')
          .select('*')
          .eq('cliente_id', clienteData.id)
          .eq('usado', false),
      ])

      setHistorial(historialData || [])
      setCupones(cuponesData || [])
    } catch (err) {
      console.error('🔴 Error al buscar:', err)
      setError('Error al buscar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      compra: '🛍️ Compra',
      ajuste_admin: '⚙️ Ajuste',
      canje: '🎁 Canje',
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star size={32} className="fill-amber-300 text-amber-300" />
            <h1 className="text-3xl sm:text-4xl font-bold">Mis YaguaMillas</h1>
          </div>
          <p className="text-white text-lg">Consultá tus YaguaMillas acumulados y tu historial de compras</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!cliente ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <form onSubmit={handleBuscar} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Ingresá tu DNI
                </label>
                <p className="text-gray-600 text-sm mb-4">
                  Te mostraremos tus YaguaMillas acumulados y el historial de tu programa de lealtad
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value.replace(/\D/g, '').slice(0, 8))
                      setError('')
                    }}
                    placeholder="12345678"
                    maxLength={8}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-semibold outline-none focus:border-primary text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={loading || dni.length !== 8}
                    className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span className="hidden sm:inline">Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        <span className="hidden sm:inline">Buscar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && searched && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card de YaguaMillas Actuales */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-amber-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-2">
                    YaguaMillas Acumulados
                  </p>
                  <h2 className="text-5xl sm:text-6xl font-bold text-amber-600 mb-2">
                    {cliente.puntos_acumulados || 0}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    ¡Seguí comprando para acumular más YaguaMillas! 🐾
                  </p>

                  {/* Cupones Info */}
                  <div className="bg-white/70 rounded-lg p-3 mt-4">
                    <p className="text-xs text-amber-700 font-semibold mb-2">🎁 CUPONES DISPONIBLES</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">{cupones.length}</span>
                      <div className="text-xs text-gray-700">
                        <p>Cupones de <strong>10% OFF</strong></p>
                        <p className="text-gray-600">(100 millas = 1 cupón)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-amber-400">
                  <Star size={64} className="fill-current" />
                </div>
              </div>
            </div>

            {/* Cupones Section */}
            {cupones.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={24} className="fill-green-500 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-900">Tus Cupones de Descuento</h3>
                </div>

                <div className="space-y-3">
                  {cupones.map((cupon, index) => (
                    <div
                      key={cupon.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white rounded-lg px-4 py-2">
                          <p className="text-lg font-bold">{cupon.porcentaje_descuento}%</p>
                          <p className="text-xs">DESCUENTO</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Cupón #{index + 1}</p>
                          <p className="text-sm text-gray-600">Usable en tu próxima compra</p>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">✓ Disponible</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>¿Cómo funcionan?</strong> Tus cupones son válidos en cualquier compra. Cada 100 YaguaMillas que acumules genera un cupón de 10% de descuento.
                    Si tienes {(cliente.puntos_acumulados || 0) - ((cupones.length) * 100)} YaguaMillas disponibles, podrás generar {Math.floor(((cliente.puntos_acumulados || 0) - ((cupones.length) * 100)) / 100)} cupón más cuando acumules 100 más.
                  </p>
                </div>
              </div>
            )}

            {cupones.length === 0 && (cliente.puntos_acumulados || 0) >= 100 && (
              <div className="bg-blue-50 rounded-2xl shadow p-6 border-2 border-blue-200">
                <p className="text-center">
                  <span className="text-lg font-bold text-blue-900">¡Felicitaciones! 🎉</span>
                  <p className="text-blue-700 mt-2">Ya acumulaste suficientes YaguaMillas para generar cupones. El admin puede generarlos desde el panel de administración.</p>
                </p>
              </div>
            )}

            {/* Info del Cliente */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Datos personales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Nombre</p>
                  <p className="text-lg font-semibold text-gray-900">{cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">DNI</p>
                  <p className="text-lg font-semibold text-gray-900">{cliente.dni}</p>
                </div>
                {cliente.telefono && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Teléfono</p>
                    <p className="text-lg font-semibold text-gray-900">{cliente.telefono}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Cliente desde</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(cliente.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Historial */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={24} className="text-primary" />
                <h3 className="text-xl font-bold text-gray-900">Historial de YaguaMillas</h3>
              </div>

              {historial.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Todavía no hay movimientos de YaguaMillas</p>
                  <p className="text-gray-400 text-sm mt-2">Cuando hagas tu primer pedido, aparecerá aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{getTipoLabel(item.tipo).split(' ')[0]}</span>
                          <p className="font-semibold text-gray-900">
                            {getTipoLabel(item.tipo)}
                          </p>
                        </div>
                        {item.referencia && (
                          <p className="text-xs text-gray-500">
                            Ref: {item.referencia}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                          <Calendar size={12} />
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        item.cantidad_puntos > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.cantidad_puntos > 0 ? '+' : ''}{item.cantidad_puntos}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón para volver a buscar */}
            <button
              onClick={() => {
                setCliente(null)
                setDni('')
                setHistorial([])
                setError('')
                setSearched(false)
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition"
            >
              Buscar otro DNI
            </button>
          </div>
        )}

        {/* Mejores Productos para Acumular YaguaMillas */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <Star size={28} className="fill-amber-400 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Mejores Productos para Acumular YaguaMillas
            </h2>
          </div>

          {loadingProductos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="text-primary animate-spin" />
            </div>
          ) : productosTop.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosTop.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
                >
                  {/* Imagen */}
                  <div className="h-48 bg-gray-100">
                    {producto.imagen_url ? (
                      <LazyImage
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        width={300}
                        height={192}
                        className="w-full h-full"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg viewBox="0 0 24 24" className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L7 21" />
                        </svg>
                      </div>
                    )}
                    {/* Badge YaguaMillas */}
                    <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-xl p-3 shadow-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star size={16} className="fill-amber-600 text-amber-600" />
                      </div>
                      <p className="text-xl font-bold text-amber-900">{producto.puntos}</p>
                      <p className="text-xs text-amber-800 font-semibold">millas</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
                        {producto.nombre}
                      </h3>
                      {producto.presentacion && (
                        <p className="text-xs text-gray-500 mt-1">📦 {producto.presentacion}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Precio: <span className="font-bold text-primary">{formatPrice(producto.precio)}</span>
                      </p>
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {producto.categoria}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => addItem(producto, 1)}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingCart size={16} />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/mejores-yaguamillas"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition flex items-center gap-2"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>

        {/* Info General */}
        <div className="mt-12 bg-primary/5 rounded-2xl p-6 border border-primary/20">
          <h3 className="font-bold text-gray-900 mb-3">💡 ¿Cómo funcionan los YaguaMillas?</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>✓ Acumulas <strong>YaguaMillas por cada compra</strong> en El Yagua Veterinaria</li>
            <li>✓ Cada producto tiene <strong>diferentes YaguaMillas</strong> según su valor</li>
            <li>✓ <strong>Necesitas ingresar tu DNI</strong> al hacer el pedido para que se acumulen</li>
            <li>✓ Los YaguaMillas <strong>nunca vencen</strong> y se acumulan en tu cuenta</li>
            <li>✓ Podés <strong>consultar tu saldo aquí</strong> en cualquier momento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
