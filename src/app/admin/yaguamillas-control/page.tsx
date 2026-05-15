'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'
import { ArrowLeft, Gift, Star, Zap, Loader2, Search, Trash2, Plus, X, Edit2, Check } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Cupon {
  id: string
  cliente_id: string
  codigo: string
  descuento_porcentaje: number
  usado: boolean
  auto_generado?: boolean
  created_at: string
}

interface Milestone {
  id: string
  millas_requeridas: number
  descuento_porcentaje: number
  activo: boolean
}

interface ClienteConInfo extends Cliente {
  cupones_disponibles: number
  cupones_usados: number
}

export default function YaguamillasControlPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'clientes' | 'cupones' | 'hitos'>('clientes')
  const [clientes, setClientes] = useState<ClienteConInfo[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [setupRequired, setSetupRequired] = useState(false)

  // Form states for adding/editing
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [milestoneForm, setMilestoneForm] = useState({ millas: '', descuento: '', activo: true })
  const [adjustingCliente, setAdjustingCliente] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [showCuponForm, setShowCuponForm] = useState(false)
  const [cuponForm, setCuponForm] = useState({ cliente_id: '', descuento: '', codigo: '' })

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/admin')
        return
      }
      await Promise.all([fetchClientes(), fetchCupones(), fetchMilestones()])
    }
    init()
  }, [router])

  const fetchClientes = async () => {
    try {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .order('puntos_acumulados', { ascending: false })

      const { data: cuponesData } = await supabase.from('cupones').select('*')

      if (clientesData) {
        const clientesConInfo = clientesData.map((c) => {
          const cuponesDisp = (cuponesData || []).filter(
            (cu) => cu.cliente_id === c.id && !cu.usado
          ).length
          const cuponesUsados = (cuponesData || []).filter(
            (cu) => cu.cliente_id === c.id && cu.usado
          ).length

          return {
            ...c,
            cupones_disponibles: cuponesDisp,
            cupones_usados: cuponesUsados,
          }
        })
        setClientes(clientesConInfo)
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
    }
  }

  const fetchCupones = async () => {
    try {
      const { data } = await supabase
        .from('cupones')
        .select('*')
        .order('created_at', { ascending: false })
      setCupones(data || [])
    } catch (error) {
      console.error('Error fetching cupones:', error)
    }
  }

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('millas_requeridas', { ascending: true })

      if (error?.message?.includes('table') || error?.message?.includes('milestones')) {
        setSetupRequired(true)
        return
      }

      setMilestones(data || [])
    } catch (error) {
      console.error('Error fetching milestones:', error)
      setSetupRequired(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustPuntos = async (clienteId: string) => {
    if (!adjustAmount || !adjustReason) {
      alert('Completa todos los campos')
      return
    }

    try {
      const { error } = await supabase.rpc('adjust_puntos_manual', {
        p_cliente_id: clienteId,
        p_cantidad: parseInt(adjustAmount),
        p_motivo: adjustReason,
      })

      if (error) {
        alert('Error: ' + error.message)
        return
      }

      alert('✓ Puntos ajustados')
      setAdjustingCliente(null)
      setAdjustAmount('')
      setAdjustReason('')
      await fetchClientes()
    } catch (error) {
      alert('Error: ' + String(error))
    }
  }

  const handleSaveMilestone = async () => {
    if (!milestoneForm.millas || !milestoneForm.descuento) {
      alert('Completa todos los campos')
      return
    }

    try {
      const body = {
        millas_requeridas: parseInt(milestoneForm.millas),
        descuento_porcentaje: parseInt(milestoneForm.descuento),
        activo: milestoneForm.activo,
      }

      const url = '/api/admin/milestones'
      const method = editingMilestone ? 'PUT' : 'POST'
      const payload = editingMilestone ? { ...body, id: editingMilestone.id } : body

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        alert('✓ Hito guardado')
        setShowMilestoneForm(false)
        setEditingMilestone(null)
        setMilestoneForm({ millas: '', descuento: '', activo: true })
        await fetchMilestones()
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      alert('Error: ' + String(error))
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('¿Eliminar este hito?')) return

    try {
      const res = await fetch(`/api/admin/milestones?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        await fetchMilestones()
      }
    } catch (error) {
      alert('Error: ' + String(error))
    }
  }

  const handleDeleteCupon = async (cuponId: string) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      await supabase.from('cupones').delete().eq('id', cuponId)
      await fetchCupones()
    } catch (error) {
      alert('Error: ' + String(error))
    }
  }

  const handleCreateCupon = async () => {
    if (!cuponForm.cliente_id || !cuponForm.descuento || !cuponForm.codigo) {
      alert('Completa todos los campos')
      return
    }

    try {
      const { error } = await supabase.from('cupones').insert([
        {
          cliente_id: cuponForm.cliente_id,
          codigo: cuponForm.codigo,
          descuento_porcentaje: parseInt(cuponForm.descuento),
          activo: true,
          usado: false,
        },
      ])

      if (error) {
        alert('Error: ' + error.message)
        return
      }

      alert('✓ Cupón creado')
      setCuponForm({ cliente_id: '', descuento: '', codigo: '' })
      setShowCuponForm(false)
      await fetchCupones()
    } catch (error) {
      alert('Error: ' + String(error))
    }
  }

  const filteredClientes = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.dni.includes(searchTerm)
  )

  const filteredCupones = cupones.filter((c) => {
    const cliente = clientes.find((cl) => cl.id === c.cliente_id)
    return (
      cliente &&
      (cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.dni.includes(searchTerm))
    )
  })

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-gray-100 p-2 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star size={24} className="text-amber-500" /> Centro de Control YaguaMillas
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            {[
              { id: 'clientes', label: 'Clientes & YaguaMillas', icon: Star },
              { id: 'cupones', label: 'Cupones', icon: Gift },
              { id: 'hitos', label: 'Hitos de YaguaMillas', icon: Zap },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition ${
                  tab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* CLIENTES TAB */}
        {tab === 'clientes' && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {filteredClientes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Star size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay clientes</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="font-bold text-gray-900">{cliente.nombre}</p>
                        <p className="text-xs text-gray-400">DNI: {cliente.dni}</p>
                      </div>

                      <div className="bg-amber-50 px-4 py-3 rounded-lg">
                        <p className="text-xs text-amber-600 font-semibold">YaguaMillas</p>
                        <p className="text-2xl font-bold text-amber-700">{cliente.puntos_acumulados || 0}</p>
                      </div>

                      <div className="bg-green-50 px-4 py-3 rounded-lg">
                        <p className="text-xs text-green-600 font-semibold">Cupones</p>
                        <p className="text-2xl font-bold text-green-700">{cliente.cupones_disponibles}</p>
                        {cliente.cupones_usados > 0 && (
                          <p className="text-xs text-green-600 mt-1">{cliente.cupones_usados} usados</p>
                        )}
                      </div>

                      <div className="bg-blue-50 px-4 py-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-semibold">Próx. Hito</p>
                        <p className="text-lg font-bold text-blue-700">
                          {milestones.find((m) => m.millas_requeridas > (cliente.puntos_acumulados || 0))
                            ?.millas_requeridas || '—'}
                        </p>
                      </div>

                      <button
                        onClick={() => setAdjustingCliente(cliente.id)}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Ajustar
                      </button>
                    </div>

                    {adjustingCliente === cliente.id && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="Cantidad (+ o -)"
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          placeholder="Motivo"
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAdjustPuntos(cliente.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1"
                          >
                            <Check size={16} /> Guardar
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingCliente(null)
                              setAdjustAmount('')
                              setAdjustReason('')
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUPONES TAB */}
        {tab === 'cupones' && (
          <div className="space-y-4">
            {!showCuponForm ? (
              <button
                onClick={() => setShowCuponForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                <Plus size={20} />
                Crear Cupón Manual
              </button>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-bold mb-4">Crear Cupón Manual</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select
                    value={cuponForm.cliente_id}
                    onChange={(e) => setCuponForm({ ...cuponForm, cliente_id: e.target.value })}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.dni})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cuponForm.codigo}
                    onChange={(e) => setCuponForm({ ...cuponForm, codigo: e.target.value })}
                    placeholder="Código del cupón (ej: PROMO10)"
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cuponForm.descuento}
                    onChange={(e) => setCuponForm({ ...cuponForm, descuento: e.target.value })}
                    placeholder="Descuento %"
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateCupon}
                    className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-3 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl flex-1"
                  >
                    <Check size={20} />
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowCuponForm(false)
                      setCuponForm({ cliente_id: '', descuento: '', codigo: '' })
                    }}
                    className="bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition cursor-pointer shadow-md hover:shadow-lg flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente..."
                className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Descuento</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCupones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No hay cupones
                      </td>
                    </tr>
                  ) : (
                    filteredCupones.map((cupon) => {
                      const cliente = clientes.find((c) => c.id === cupon.cliente_id)
                      return (
                        <tr key={cupon.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{cliente?.nombre || '—'}</td>
                          <td className="px-6 py-4 text-sm font-mono">{cupon.codigo}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">
                            {cupon.descuento_porcentaje}%
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                cupon.usado
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {cupon.usado ? 'Usado' : 'Disponible'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                cupon.auto_generado
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {cupon.auto_generado ? 'Automático' : 'Manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteCupon(cupon.id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HITOS TAB */}
        {tab === 'hitos' && (
          <div className="space-y-4">
            {setupRequired ? (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-red-900 mb-3">⚠️ Configuración requerida</h2>
                <p className="text-red-800 mb-4">
                  La tabla de hitos aún no ha sido creada en la base de datos.
                </p>
                <a
                  href="/admin/setup-db"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  → Ejecutar SQL de configuración
                </a>
              </div>
            ) : (
              <>
                {!showMilestoneForm ? (
                  <button
                    onClick={() => setShowMilestoneForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    <Plus size={20} />
                    Nuevo Hito
                  </button>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4">
                      {editingMilestone ? 'Editar Hito' : 'Nuevo Hito'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="number"
                        min="1"
                        value={milestoneForm.millas}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, millas: e.target.value })}
                        placeholder="YaguaMillas requeridas"
                        className="border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={milestoneForm.descuento}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, descuento: e.target.value })}
                        placeholder="Descuento %"
                        className="border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={milestoneForm.activo}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, activo: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label>Activo</label>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveMilestone}
                        className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-3 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl flex-1"
                      >
                        <Check size={20} />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setShowMilestoneForm(false)
                          setEditingMilestone(null)
                          setMilestoneForm({ millas: '', descuento: '', activo: true })
                        }}
                        className="bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition cursor-pointer shadow-md hover:shadow-lg flex-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-gray-500 text-sm">YaguaMillas Requeridas</p>
                          <p className="text-3xl font-bold text-blue-600">{milestone.millas_requeridas}</p>
                          <p className="text-gray-600 text-sm mt-2">
                            {milestone.descuento_porcentaje}% descuento
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-semibold ${
                              milestone.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {milestone.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMilestone(milestone)
                              setMilestoneForm({
                                millas: milestone.millas_requeridas.toString(),
                                descuento: milestone.descuento_porcentaje.toString(),
                                activo: milestone.activo,
                              })
                              setShowMilestoneForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
