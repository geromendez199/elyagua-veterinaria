'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'
import { ArrowLeft, Star, Loader2, Check, X, Search, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'

interface ClienteYaguamillas extends Cliente {
  pedidos_count?: number
  puntos_gastos?: number
}

interface PuntosHistorial {
  id: string
  cliente_id: string
  tipo: 'compra' | 'ajuste_admin' | 'canje'
  cantidad_puntos: number
  referencia?: string
  created_at: string
}

export default function AdminYaguamillasPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteYaguamillas[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'puntos' | 'nombre' | 'reciente'>('puntos')
  const [adjustingPuntosId, setAdjustingPuntosId] = useState<string | null>(null)
  const [puntosForm, setPuntosForm] = useState({ cantidad: '', motivo: '' })
  const [savingPuntos, setSavingPuntos] = useState(false)
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalYaguamillas: 0,
    promedioYaguamillas: 0,
    topCliente: { nombre: '', puntos: 0 },
  })

  const fetchData = async () => {
    try {
      const [{ data: clientesData }, { data: pedidosData }, { data: historialData }] = await Promise.all([
        supabase.from('clientes').select('*').order('puntos_acumulados', { ascending: false }),
        supabase.from('pedidos').select('cliente_dni, total').not('cliente_dni', 'is', null),
        supabase.from('historial_puntos').select('*'),
      ])

      if (clientesData) {
        const clientesWithStats = clientesData.map((cliente) => {
          const clientePedidos = (pedidosData || []).filter((p) => p.cliente_dni === cliente.dni)
          return {
            ...cliente,
            pedidos_count: clientePedidos.length,
            puntos_gastos: clientePedidos.reduce((sum, p) => sum + (p.total || 0), 0),
          }
        })

        setClientes(clientesWithStats)

        // Calcular stats
        const totalYaguamillas = clientesWithStats.reduce((sum, c) => sum + (c.puntos_acumulados || 0), 0)
        const topCliente = clientesWithStats[0] || { nombre: '-', puntos_acumulados: 0 }

        setStats({
          totalClientes: clientesWithStats.length,
          totalYaguamillas,
          promedioYaguamillas: clientesWithStats.length > 0 ? Math.round(totalYaguamillas / clientesWithStats.length) : 0,
          topCliente: {
            nombre: topCliente.nombre,
            puntos: topCliente.puntos_acumulados || 0,
          },
        })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const savePuntosAdjustment = async (clienteId: string) => {
    alert('1. Iniciando...')

    const cantidad = parseInt(puntosForm.cantidad)
    const motivo = puntosForm.motivo

    alert('2. Valores: ' + cantidad + ', ' + motivo)

    if (!puntosForm.cantidad || !motivo) {
      alert('Debe llenar cantidad y motivo')
      return
    }

    if (isNaN(cantidad)) {
      alert('Cantidad debe ser un número')
      return
    }

    alert('3. Validaciones OK')
    setSavingPuntos(true)

    try {
      const response = await fetch('/api/admin/clientes/puntos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          cantidad: cantidad,
          motivo: motivo,
        }),
      })

      alert('4. Status: ' + response.status)

      const result = await response.json()
      alert('5. Resultado: ' + JSON.stringify(result))

      if (result.success) {
        alert('✓ Guardado!')
        await fetchData()
        setAdjustingPuntosId(null)
        setPuntosForm({ cantidad: '', motivo: '' })
      } else {
        alert('Error: ' + (result.error || 'No guardado'))
      }
    } catch (err) {
      alert('Error: ' + String(err))
    } finally {
      setSavingPuntos(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/admin')
        return
      }
      await fetchData()
    }
    init()
  }, [router])

  const clientesFiltrados = clientes
    .filter((c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm) ||
      (c.telefono || '').includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'puntos') return (b.puntos_acumulados || 0) - (a.puntos_acumulados || 0)
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'reciente') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 min-w-0">
            <Star size={24} className="fill-amber-300 text-amber-300 shrink-0" />
            YaguaMillas
          </h1>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="bg-white/20 text-sm font-semibold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
              {clientes.length} clientes
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-blue-600" />
                <p className="text-xs text-blue-600 font-semibold uppercase">Total de Clientes</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.totalClientes}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="fill-amber-600 text-amber-600" />
                <p className="text-xs text-amber-600 font-semibold uppercase">Total YaguaMillas</p>
              </div>
              <p className="text-3xl font-bold text-amber-900">{stats.totalYaguamillas.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-600" />
                <p className="text-xs text-green-600 font-semibold uppercase">Promedio</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.promedioYaguamillas}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-purple-600" />
                <p className="text-xs text-purple-600 font-semibold uppercase">Top Cliente</p>
              </div>
              <p className="text-sm font-bold text-purple-900 truncate">{stats.topCliente.nombre}</p>
              <p className="text-xs text-purple-700 mt-1">{stats.topCliente.puntos} millas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Buscador y Ordenamiento */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono..."
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition bg-white"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'puntos' | 'nombre' | 'reciente')}
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition bg-white font-medium"
          >
            <option value="puntos">Mayor YaguaMillas</option>
            <option value="reciente">Más Recientes</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>

        {/* Tabla */}
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Star size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay clientes</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-primary">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">DNI</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">YaguaMillas</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Pedidos</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Cliente Desde</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded font-mono">
                        {cliente.dni}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {cliente.telefono ? (
                        <a
                          href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          {cliente.telefono}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="bg-amber-100 text-amber-700 font-bold px-3 py-2 rounded-lg inline-block">
                        {cliente.puntos_acumulados || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700">{cliente.pedidos_count || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-600">{formatDate(cliente.created_at)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => {
                          setAdjustingPuntosId(cliente.id)
                          setPuntosForm({ cantidad: '', motivo: '' })
                        }}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition text-sm inline-flex items-center gap-2"
                      >
                        <Zap size={16} />
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajustar YaguaMillas */}
      {adjustingPuntosId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">Ajustar YaguaMillas</h3>
              <button
                onClick={() => setAdjustingPuntosId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {(() => {
                const cliente = clientes.find((c) => c.id === adjustingPuntosId)
                return (
                  <>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold uppercase">Cliente</p>
                      <p className="text-lg font-bold text-amber-900 mt-1">{cliente?.nombre}</p>
                      <p className="text-sm text-amber-700 mt-2">
                        YaguaMillas actuales: <span className="font-bold">{cliente?.puntos_acumulados || 0}</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad a ajustar *</label>
                      <input
                        type="number"
                        value={puntosForm.cantidad}
                        onChange={(e) => setPuntosForm({ ...puntosForm, cantidad: e.target.value })}
                        placeholder="Ej: 10 (suma), -5 (resta)"
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">Usa números negativos para restar YaguaMillas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo del ajuste *</label>
                      <textarea
                        value={puntosForm.motivo}
                        onChange={(e) => setPuntosForm({ ...puntosForm, motivo: e.target.value })}
                        placeholder="Ej: Ajuste por devolución, promoción especial, etc."
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setAdjustingPuntosId(null)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => savePuntosAdjustment(adjustingPuntosId)}
                        disabled={savingPuntos}
                        className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingPuntos ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Ajustando...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Ajustar
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
