'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ArrowLeft, Plus, Trash2, Edit2, LogOut, ShoppingBag, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Coupon {
  id: string
  codigo: string
  descuento_porcentaje: number
  expires_at: string | null
  activo: boolean
  created_at: string
}

export default function AdminCuponesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ codigo: '', descuento_porcentaje: '', expires_at: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin'); return }
    await fetchCoupons()
  }

  const fetchCoupons = async () => {
    try {
      const { data } = await supabase.from('cupones').select('*').order('created_at', { ascending: false })
      setCoupons(data || [])
    } catch (err: any) {
      showToast('Error cargando cupones: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSave = async () => {
    if (!formData.codigo || !formData.descuento_porcentaje) {
      showToast('Falta completar campos')
      return
    }

    setSaving(true)
    try {
      const descuento_porcentaje = parseFloat(formData.descuento_porcentaje)
      if (isNaN(descuento_porcentaje) || descuento_porcentaje <= 0) throw new Error('Descuento inválido')

      if (editingId) {
        await supabase.from('cupones').update({
          codigo: formData.codigo,
          descuento_porcentaje,
          expires_at: formData.expires_at || null,
        }).eq('id', editingId)
      } else {
        await supabase.from('cupones').insert({
          codigo: formData.codigo,
          descuento_porcentaje,
          expires_at: formData.expires_at || null,
          activo: true,
        })
      }
      showToast(editingId ? 'Cupón actualizado' : 'Cupón creado')
      setFormData({ codigo: '', descuento_porcentaje: '', expires_at: '' })
      setEditingId(null)
      setShowModal(false)
      await fetchCoupons()
    } catch (err: any) {
      showToast('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      await supabase.from('cupones').delete().eq('id', id)
      showToast('Cupón eliminado')
      await fetchCoupons()
    } catch (err: any) {
      showToast('Error: ' + err.message)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      codigo: coupon.codigo,
      descuento_porcentaje: String(coupon.descuento_porcentaje),
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    })
    setEditingId(coupon.id)
    setShowModal(true)
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando cupones...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Tag size={22} />
            Cupones de Descuento
          </h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => { setEditingId(null); setFormData({ codigo: '', descuento_porcentaje: '', expires_at: '' }); setShowModal(true) }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
            >
              <Plus size={16} />
              Nuevo Cupón
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-1.5 text-sm font-semibold hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
            {toast}
          </div>
        )}

        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Tag className="mx-auto mb-4 text-gray-300" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin cupones creados</h2>
            <p className="text-gray-500 mb-6">Crea tu primer cupón de descuento</p>
            <button
              onClick={() => { setEditingId(null); setFormData({ codigo: '', descuento_porcentaje: '', expires_at: '' }); setShowModal(true) }}
              className="inline-block bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
            >
              Crear Cupón
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Código</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Descuento</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Estado</th>
                    <th className="px-6 py-3 text-right text-sm font-bold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary text-lg">{coupon.codigo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{coupon.descuento_porcentaje}%</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coupon.expires_at
                          ? new Date(coupon.expires_at).toLocaleDateString('es-AR')
                          : 'Sin vencimiento'}
                      </td>
                      <td className="px-6 py-4">
                        {isExpired(coupon.expires_at) ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Vencido</span>
                        ) : coupon.activo ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Activo</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold">Inactivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Cupón' : 'Nuevo Cupón'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="ej: DESCUENTO10"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descuento (%)</label>
                <input
                  type="number"
                  value={formData.descuento_porcentaje}
                  onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })}
                  placeholder="ej: 10"
                  step="1"
                  max="100"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vencimiento (opcional)</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:border-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
