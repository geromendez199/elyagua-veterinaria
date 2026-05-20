'use client'

import { useState, useEffect } from 'react'
import { Oferta } from '@/types'
import OfertaForm from './OfertaForm'
import OfertasTable from './OfertasTable'
import LogoutButton from './LogoutButton'

export default function OfertasManager() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [activoFilter, setActivoFilter] = useState('')

  useEffect(() => {
    fetchOfertas()
  }, [searchQuery, tipoFilter, activoFilter])

  async function fetchOfertas() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (tipoFilter) params.append('tipo', tipoFilter)
      if (activoFilter) params.append('activo', activoFilter)

      const response = await fetch(`/api/admin/ofertas?${params}`)
      if (!response.ok) throw new Error('Error fetching ofertas')

      const { data } = await response.json()
      setOfertas(data || [])
    } catch (error) {
      console.error('Error fetching ofertas:', error)
      setOfertas([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(ofertaId: string) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oferta?')) return

    try {
      const response = await fetch(`/api/admin/ofertas?id=${ofertaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error deleting oferta')

      setOfertas(ofertas.filter((o) => o.id !== ofertaId))
    } catch (error) {
      console.error('Error deleting oferta:', error)
      alert('Error al eliminar oferta')
    }
  }

  async function handleToggleActivo(oferta: Oferta) {
    try {
      const response = await fetch(`/api/admin/ofertas?id=${oferta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !oferta.activo }),
      })

      if (!response.ok) throw new Error('Error updating oferta')

      setOfertas(
        ofertas.map((o) => (o.id === oferta.id ? { ...o, activo: !o.activo } : o))
      )
    } catch (error) {
      console.error('Error updating oferta:', error)
      alert('Error al actualizar oferta')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Ofertas</h1>
            <p className="text-gray-600 mt-1">Crea y edita ofertas de productos y combos</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Button */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => {
              setEditingOferta(null)
              setShowForm(!showForm)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm && !editingOferta ? 'Cancelar' : 'Nueva Oferta'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingOferta ? 'Editar Oferta' : 'Nueva Oferta'}
            </h2>
            <OfertaForm
              oferta={editingOferta || undefined}
              onSuccess={() => {
                setShowForm(false)
                setEditingOferta(null)
                fetchOfertas()
              }}
              onCancel={() => {
                setShowForm(false)
                setEditingOferta(null)
              }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar ofertas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="porcentaje">Descuento %</option>
              <option value="combo">Combo</option>
            </select>
            <select
              value={activoFilter}
              onChange={(e) => setActivoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Todas las ofertas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando ofertas...</p>
          </div>
        ) : ofertas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay ofertas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <OfertasTable
              ofertas={ofertas}
              onEdit={(oferta) => {
                setEditingOferta(oferta)
                setShowForm(true)
              }}
              onDelete={handleDelete}
              onToggleActivo={handleToggleActivo}
            />
          </div>
        )}
      </main>
    </div>
  )
}
