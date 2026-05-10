'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, MapPin, Truck, Phone, User, ArrowLeft, ShoppingBag, Check, X, Trash2, Users, Bell } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Pedido {
  id: string
  nombre: string
  telefono: string
  tipo_entrega: 'retiro' | 'envio'
  direccion: string | null
  productos: { id?: string; nombre: string; cantidad: number; precio: number }[]
  total: number
  estado: string | null
  cliente_dni: string | null
  created_at: string
}

type Filtro = 'todos' | 'pendiente' | 'confirmado' | 'cancelado'

const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-800' },
  confirmado: { label: 'Confirmado',  cls: 'bg-green-100 text-green-800'  },
  cancelado:  { label: 'Cancelado',   cls: 'bg-red-100 text-red-700'      },
}

function estadoNormalizado(estado: string | null): 'pendiente' | 'confirmado' | 'cancelado' {
  if (estado === 'confirmado') return 'confirmado'
  if (estado === 'cancelado') return 'cancelado'
  return 'pendiente'
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [accionando, setAccionando] = useState<string | null>(null)
  const [nuevoToast, setNuevoToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setNuevoToast(true)
    setTimeout(() => setNuevoToast(false), 5000)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/admin'); return }
      const { data: rows } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
      setPedidos(rows || [])
      setLoading(false)
    }
    init()
  }, [router])

  // ── Realtime: nuevos pedidos aparecen sin refresh ──────────────
  useEffect(() => {
    const channel = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          const nuevo = payload.new as Pedido
          setPedidos((prev) => {
            if (prev.some((p) => p.id === nuevo.id)) return prev
            return [nuevo, ...prev]
          })
          showToast(`Nuevo pedido de ${nuevo.nombre}`)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [showToast])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // ── Al confirmar, descuenta stock por cada producto (RPC atómica) ──
  const handleConfirmar = async (id: string) => {
    setAccionando(id)
    const pedido = pedidos.find((p) => p.id === id)

    const { error } = await supabase.from('pedidos').update({ estado: 'confirmado' }).eq('id', id)
    if (!error && pedido) {
      for (const prod of pedido.productos) {
        if (prod.id) {
          await supabase.rpc('decrement_stock', { p_id: prod.id, p_amount: prod.cantidad })
        }
      }
    }

    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: 'confirmado' } : p))
    setAccionando(null)
  }

  const handleCancelar = async (id: string) => {
    setAccionando(id)
    await supabase.from('pedidos').update({ estado: 'cancelado' }).eq('id', id)
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: 'cancelado' } : p))
    setAccionando(null)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return
    setAccionando(id)
    await supabase.from('pedidos').delete().eq('id', id)
    setPedidos((prev) => prev.filter((p) => p.id !== id))
    setAccionando(null)
  }

  const counts = {
    todos:      pedidos.length,
    pendiente:  pedidos.filter((p) => estadoNormalizado(p.estado) === 'pendiente').length,
    confirmado: pedidos.filter((p) => estadoNormalizado(p.estado) === 'confirmado').length,
    cancelado:  pedidos.filter((p) => estadoNormalizado(p.estado) === 'cancelado').length,
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter((p) => estadoNormalizado(p.estado) === filtro)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando pedidos...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast: nuevo pedido */}
      {nuevoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-pulse">
          <Bell size={16} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag size={24} />
            Pedidos
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/clientes"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
            >
              <Users size={15} />
              Clientes
            </Link>
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {counts.todos} total
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {(['todos', 'pendiente', 'confirmado', 'cancelado'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                filtro === f
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f].label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filtro === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-6">
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay pedidos {filtro !== 'todos' ? `"${ESTADO_CONFIG[filtro as keyof typeof ESTADO_CONFIG]?.label.toLowerCase()}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => {
              const estado = estadoNormalizado(pedido.estado)
              const { label, cls } = ESTADO_CONFIG[estado]
              const ocupado = accionando === pedido.id

              return (
                <div key={pedido.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${
                  ocupado ? 'opacity-60 pointer-events-none' : 'border-gray-100'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User size={17} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{pedido.nombre}</p>
                          {pedido.cliente_dni && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                              DNI {pedido.cliente_dni}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} /> {pedido.telefono}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                        {label}
                      </span>
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

                  {/* Footer: entrega + acciones */}
                  <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    {/* Entrega */}
                    <div className="flex items-center gap-1.5">
                      {pedido.tipo_entrega === 'retiro' ? (
                        <>
                          <MapPin size={14} className="text-primary shrink-0" />
                          <span className="text-gray-600">Retiro en tienda</span>
                        </>
                      ) : (
                        <>
                          <Truck size={14} className="text-primary shrink-0" />
                          <span className="text-gray-600 truncate max-w-[200px]">Envío: {pedido.direccion}</span>
                        </>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${pedido.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 transition font-semibold"
                      >
                        WA
                      </a>

                      {/* Confirmar */}
                      {estado !== 'confirmado' && (
                        <button
                          onClick={() => handleConfirmar(pedido.id)}
                          title="Confirmar pedido"
                          className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1.5 rounded-full hover:bg-primary-dark transition font-semibold"
                        >
                          <Check size={12} /> Confirmar
                        </button>
                      )}

                      {/* Cancelar */}
                      {estado !== 'cancelado' && (
                        <button
                          onClick={() => handleCancelar(pedido.id)}
                          title="Cancelar pedido"
                          className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2.5 py-1.5 rounded-full hover:bg-orange-600 transition font-semibold"
                        >
                          <X size={12} /> Cancelar
                        </button>
                      )}

                      {/* Eliminar */}
                      <button
                        onClick={() => handleEliminar(pedido.id)}
                        title="Eliminar pedido"
                        className="text-gray-300 hover:text-red-500 transition p-1.5"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
