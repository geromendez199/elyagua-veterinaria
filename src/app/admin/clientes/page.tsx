'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Users, ArrowLeft, Phone, Trash2, FileText, Check, X, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import { Cliente } from '@/types'

interface ClienteConStats extends Cliente {
  pedidos_count: number
  total_gastado: number
  ultimo_pedido: string | null
}

export default function AdminClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteConStats[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notaValue, setNotaValue] = useState('')
  const [savingNota, setSavingNota] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/admin'); return }
      await fetchData()
    }
    init()
  }, [router])

  const fetchData = async () => {
    const [{ data: clientesData }, { data: pedidosData }] = await Promise.all([
      supabase.from('clientes').select('*').order('created_at', { ascending: false }),
      supabase.from('pedidos').select('cliente_dni, total, created_at').not('cliente_dni', 'is', null),
    ])

    const stats: Record<string, { count: number; total: number; ultimo: string }> = {}
    for (const p of (pedidosData || [])) {
      if (!p.cliente_dni) continue
      if (!stats[p.cliente_dni]) stats[p.cliente_dni] = { count: 0, total: 0, ultimo: p.created_at }
      stats[p.cliente_dni].count++
      stats[p.cliente_dni].total += p.total || 0
      if (p.created_at > stats[p.cliente_dni].ultimo) stats[p.cliente_dni].ultimo = p.created_at
    }

    setClientes((clientesData || []).map(c => ({
      ...c,
      pedidos_count: stats[c.dni]?.count || 0,
      total_gastado: stats[c.dni]?.total || 0,
      ultimo_pedido: stats[c.dni]?.ultimo || null,
    })))
    setLoading(false)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  const saveNota = async (id: string) => {
    setSavingNota(true)
    await supabase.from('clientes').update({ notas: notaValue, updated_at: new Date().toISOString() }).eq('id', id)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, notas: notaValue } : c))
    setEditingId(null)
    setSavingNota(false)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dni.includes(busqueda) ||
    (c.telefono || '').includes(busqueda)
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando clientes...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin/productos" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            Clientes
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
            >
              <ShoppingBag size={15} />
              Pedidos
            </Link>
            <span className="bg-white/20 text-sm font-semibold px-3 py-1 rounded-full">
              {clientes.length} registrados
            </span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI o teléfono..."
            className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-gray-900"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-6">
        {clientes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Todavía no hay clientes registrados.</p>
            <p className="text-sm mt-1">Se crean automáticamente cuando un cliente ingresa su DNI al hacer un pedido.</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No se encontraron clientes para "{busqueda}"</p>
        ) : (
          <div className="space-y-3">
            {clientesFiltrados.map(cliente => (
              <div key={cliente.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 flex gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={18} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Nombre + acciones */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900">{cliente.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-semibold">
                            DNI {cliente.dni}
                          </span>
                          {cliente.telefono && (
                            <a
                              href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`}
                              target="_blank"
                              className="text-xs text-gray-500 flex items-center gap-1 hover:text-green-600 transition"
                            >
                              <Phone size={11} /> {cliente.telefono}
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
                        className="text-gray-300 hover:text-red-500 transition p-1 shrink-0"
                        title="Eliminar cliente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-5 mt-3 flex-wrap">
                      <div>
                        <p className="text-xs text-gray-400">Pedidos</p>
                        <p className="font-bold text-gray-900 text-sm">{cliente.pedidos_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total gastado</p>
                        <p className="font-bold text-primary text-sm">{formatPrice(cliente.total_gastado)}</p>
                      </div>
                      {cliente.ultimo_pedido && (
                        <div>
                          <p className="text-xs text-gray-400">Último pedido</p>
                          <p className="font-semibold text-gray-700 text-sm">{formatDate(cliente.ultimo_pedido)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400">Cliente desde</p>
                        <p className="font-semibold text-gray-700 text-sm">{formatDate(cliente.created_at)}</p>
                      </div>
                    </div>

                    {/* Nota editable */}
                    <div className="mt-3">
                      {editingId === cliente.id ? (
                        <div className="flex gap-2 items-start">
                          <textarea
                            value={notaValue}
                            onChange={e => setNotaValue(e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary resize-none text-gray-900"
                            rows={2}
                            placeholder="Ej: Tiene un golden retriever, cliente frecuente..."
                            autoFocus
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => saveNota(cliente.id)}
                              disabled={savingNota}
                              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                              title="Guardar"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition"
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(cliente.id); setNotaValue(cliente.notas || '') }}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition"
                        >
                          <FileText size={12} />
                          <span className="italic">{cliente.notas || 'Agregar nota interna...'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
