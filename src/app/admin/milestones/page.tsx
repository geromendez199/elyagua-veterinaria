'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'

interface Milestone {
  id: string
  millas_requeridas: number
  descuento_porcentaje: number
  activo: boolean
  created_at: string
  updated_at: string
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    millas_requeridas: '',
    descuento_porcentaje: '',
    activo: true,
  })
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/admin/milestones')
      const data = await res.json()
      if (data.success) {
        setMilestones(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.millas_requeridas || !formData.descuento_porcentaje) {
      alert('Completa todos los campos')
      return
    }

    try {
      const url = '/api/admin/milestones'
      const method = editingMilestone ? 'PUT' : 'POST'
      const body = {
        ...(editingMilestone && { id: editingMilestone.id }),
        millas_requeridas: parseInt(formData.millas_requeridas),
        descuento_porcentaje: parseInt(formData.descuento_porcentaje),
        activo: formData.activo,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        fetchMilestones()
        setShowForm(false)
        setEditingMilestone(null)
        setFormData({ millas_requeridas: '', descuento_porcentaje: '', activo: true })
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving milestone:', error)
      alert('Error al guardar')
    }
  }

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setFormData({
      millas_requeridas: milestone.millas_requeridas.toString(),
      descuento_porcentaje: milestone.descuento_porcentaje.toString(),
      activo: milestone.activo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este hito?')) return

    try {
      const res = await fetch(`/api/admin/milestones?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        fetchMilestones()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('Error al eliminar')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingMilestone(null)
    setFormData({ millas_requeridas: '', descuento_porcentaje: '', activo: true })
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hitos de YaguaMillas</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Hito
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingMilestone ? 'Editar Hito' : 'Nuevo Hito'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Millas Requeridas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.millas_requeridas}
                  onChange={(e) =>
                    setFormData({ ...formData, millas_requeridas: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ej: 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descuento %
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.descuento_porcentaje}
                  onChange={(e) =>
                    setFormData({ ...formData, descuento_porcentaje: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ej: 10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Activo</label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Check size={18} />
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Millas Requeridas
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Descuento
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Activo
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No hay hitos configurados
                </td>
              </tr>
            ) : (
              milestones.map((milestone) => (
                <tr key={milestone.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{milestone.millas_requeridas}</td>
                  <td className="px-6 py-4">{milestone.descuento_porcentaje}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-sm rounded ${
                        milestone.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {milestone.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(milestone)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
        <p className="text-sm text-blue-800">
          Los hitos se generan automáticamente cuando un cliente acumula millas. Cada vez que alcanza un nuevo hito, se le genera un cupón de descuento.
        </p>
      </div>
    </div>
  )
}
