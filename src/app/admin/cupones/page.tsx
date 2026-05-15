'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'
import { ArrowLeft, Gift, Loader2, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Cupon {
  id: string
  cliente_id: string
  yaguamillas_requeridos: number
  porcentaje_descuento: number
  usado: boolean
  used_at?: string
}

interface ClienteConCupones extends Cliente {
  cupones_disponibles: number
  cupones_posibles: number
}

export default function AdminCuponesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteConCupones[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .order('puntos_acumulados', { ascending: false })

      const { data: cuponesData } = await supabase
        .from('cupones')
        .select('*')

      if (clientesData) {
        const clientesConCupones = clientesData.map((c) => {
          const cuponesPosibles = Math.floor((c.puntos_acumulados || 0) / 100)
          const cuponesDisponibles = (cuponesData || []).filter(
            (cu) => cu.cliente_id === c.id && !cu.usado
          ).length

          return {
            ...c,
            cupones_disponibles: cuponesDisponibles,
            cupones_posibles: cuponesPosibles,
          }
        })
        setClientes(clientesConCupones)
        setCupones(cuponesData || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
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

  const generateCupons = async (clienteId: string, puntos: number) => {
    setGeneratingFor(clienteId)
    try {
      const response = await fetch('/api/admin/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          cliente_puntos: puntos,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert(`✓ ${result.cupones_generados} cupón(es) generado(s)`)
        await fetchData()
      }
    } catch (err) {
      alert('Error: ' + String(err))
    } finally {
      setGeneratingFor(null)
    }
  }

  const deleteCupon = async (cuponId: string) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      await supabase.from('cupones').delete().eq('id', cuponId)
      alert('✓ Cupón eliminado')
      await fetchData()
    } catch (err) {
      alert('Error: ' + String(err))
    }
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift size={24} /> Cupones
          </h1>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Gift size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay clientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{cliente.nombre}</h3>
                    <p className="text-sm text-gray-500">DNI: {cliente.dni}</p>
                    <div className="flex gap-4 mt-3 flex-wrap">
                      <div className="bg-amber-50 px-4 py-2 rounded">
                        <p className="text-xs text-amber-600 font-semibold">YaguaMillas</p>
                        <p className="text-xl font-bold text-amber-700">{cliente.puntos_acumulados || 0}</p>
                      </div>
                      <div className="bg-blue-50 px-4 py-2 rounded">
                        <p className="text-xs text-blue-600 font-semibold">Cupones Posibles</p>
                        <p className="text-xl font-bold text-blue-700">{cliente.cupones_posibles}</p>
                      </div>
                      <div className="bg-green-50 px-4 py-2 rounded">
                        <p className="text-xs text-green-600 font-semibold">Disponibles</p>
                        <p className="text-xl font-bold text-green-700">{cliente.cupones_disponibles}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateCupons(cliente.id, cliente.puntos_acumulados || 0)}
                    disabled={generatingFor === cliente.id}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {generatingFor === cliente.id ? 'Generando...' : 'Generar'}
                  </button>
                </div>

                {cliente.cupones_disponibles > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Cupones Disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {cupones
                        .filter((c) => c.cliente_id === cliente.id && !c.usado)
                        .slice(0, 5)
                        .map((cupon) => (
                          <div
                            key={cupon.id}
                            className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded text-sm"
                          >
                            <span className="font-bold text-green-700">{cupon.porcentaje_descuento}% OFF</span>
                            <button
                              onClick={() => deleteCupon(cupon.id)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      {cliente.cupones_disponibles > 5 && (
                        <span className="text-xs text-gray-500">+{cliente.cupones_disponibles - 5} más</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
