'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, MapPin, Truck, Phone, User, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Pedido {
  id: string
  nombre: string
  telefono: string
  tipo_entrega: 'retiro' | 'envio'
  direccion: string | null
  productos: { nombre: string; cantidad: number; precio: number }[]
  total: number
  estado: string
  created_at: string
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/admin'); return }
      const { data: rows } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
      setPedidos(rows || [])
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando pedidos...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin/productos" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag size={24} />
            Historial de pedidos
          </h1>
          <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full ml-auto">
            {pedidos.length} total
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        {pedidos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Todavía no hay pedidos registrados.</p>
            <p className="text-sm mt-1">Aparecerán aquí cuando los clientes confirmen por WhatsApp.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header del pedido */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <User size={17} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{pedido.nombre}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={11} /> {pedido.telefono}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(pedido.created_at)}</p>
                    <p className="font-bold text-primary text-lg">{formatPrice(pedido.total)}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="px-5 py-3 space-y-1.5">
                  {pedido.productos.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{p.nombre} <span className="text-gray-400">×{p.cantidad}</span></span>
                      <span className="text-gray-900 font-semibold">{formatPrice(p.precio * p.cantidad)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer: entrega */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-sm">
                  {pedido.tipo_entrega === 'retiro' ? (
                    <>
                      <MapPin size={14} className="text-primary shrink-0" />
                      <span className="text-gray-600">Retiro en tienda</span>
                    </>
                  ) : (
                    <>
                      <Truck size={14} className="text-primary shrink-0" />
                      <span className="text-gray-600">Envío a: {pedido.direccion}</span>
                    </>
                  )}
                  <a
                    href={`https://wa.me/${pedido.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    className="ml-auto text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition font-semibold"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
