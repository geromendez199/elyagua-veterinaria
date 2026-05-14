'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, X, Check, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Consejo, ConsejoCategoria, ConsejoTipoMascota, CONSEJO_CATEGORIES } from '@/types'
import AdminAgeRangeSlider from '@/components/AdminAgeRangeSlider'

type AdminTab = 'consejos'

interface FormData {
  titulo: string
  contenido: string
  imagen_url: string
  tipo_mascota: ConsejoTipoMascota
  edad_minima: number
  edad_maxima: string
  categoria: ConsejoCategoria
  orden: number
  activo: boolean
}

const emptyForm: FormData = {
  titulo: '',
  contenido: '',
  imagen_url: '',
  tipo_mascota: 'ambos',
  edad_minima: 0,
  edad_maxima: '',
  categoria: 'vacunacion',
  orden: 0,
  activo: true,
}

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 bg-white text-sm'
const textareaCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 bg-white text-sm resize-none'

export default function AdminConsejos() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>('consejos')
  const [consejos, setConsejos] = useState<Consejo[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/admin')
        return
      }
      setUser(user)
      fetchConsejos()
    })
  }, [router])

  const fetchConsejos = async () => {
    try {
      const { data, error } = await supabase
        .from('consejos')
        .select('*')
        .order('categoria')
        .order('orden')
      if (error) throw error
      setConsejos(data || [])
    } catch (err) {
      console.error('Error fetching:', err)
      showToast('Error al cargar consejos')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const handleImageChange = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.imagen_url || null

    setUploading(true)
    try {
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('consejos')
        .upload(filename, imageFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('consejos').getPublicUrl(filename)
      return urlData.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      showToast('Error al subir imagen')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      showToast('Título y contenido son requeridos')
      return
    }

    setUploading(true)
    try {
      const imageUrl = await uploadImage()
      if (imageFile && !imageUrl) throw new Error('Failed to upload image')

      const payload = {
        titulo: form.titulo,
        contenido: form.contenido,
        imagen_url: imageUrl,
        tipo_mascota: form.tipo_mascota,
        edad_minima: form.edad_minima,
        edad_maxima: form.edad_maxima ? parseInt(form.edad_maxima) : null,
        categoria: form.categoria,
        orden: form.orden,
        activo: form.activo,
      }

      if (editingId) {
        const { error } = await supabase.from('consejos').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('✅ Consejo actualizado')
      } else {
        const { error } = await supabase.from('consejos').insert([payload])
        if (error) throw error
        showToast('✅ Consejo creado')
      }

      setShowModal(false)
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setEditingId(null)
      fetchConsejos()
    } catch (err) {
      console.error('Save error:', err)
      showToast('Error al guardar')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (consejo: Consejo) => {
    setEditingId(consejo.id)
    setForm({
      titulo: consejo.titulo,
      contenido: consejo.contenido,
      imagen_url: consejo.imagen_url || '',
      tipo_mascota: consejo.tipo_mascota,
      edad_minima: consejo.edad_minima,
      edad_maxima: consejo.edad_maxima ? String(consejo.edad_maxima) : '',
      categoria: consejo.categoria,
      orden: consejo.orden,
      activo: consejo.activo,
    })
    setImagePreview(consejo.imagen_url)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este consejo?')) return
    try {
      const { error } = await supabase.from('consejos').delete().eq('id', id)
      if (error) throw error
      showToast('✅ Consejo eliminado')
      fetchConsejos()
    } catch (err) {
      console.error('Delete error:', err)
      showToast('Error al eliminar')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setEditingId(null)
  }

  const filteredConsejos = consejos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-white/10 p-2 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Admin - Consejos Veterinarios</h1>
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="text-white text-sm hover:bg-white/10 px-3 py-2 rounded transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Consejos Management */}
          <>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por título o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 ${inputCls}`}
              />
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
              >
                + Nuevo Consejo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border-l-4 border-primary">
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-primary">{consejos.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-gray-600 text-sm">Activos</p>
                <p className="text-2xl font-bold text-green-600">{consejos.filter((c) => c.activo).length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm">Perros</p>
                <p className="text-2xl font-bold text-blue-600">
                  {consejos.filter((c) => c.tipo_mascota === 'perro' || c.tipo_mascota === 'ambos').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm">Gatos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {consejos.filter((c) => c.tipo_mascota === 'gato' || c.tipo_mascota === 'ambos').length}
                </p>
              </div>
            </div>

        {/* Table/Cards View */}
        {filteredConsejos.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No hay consejos disponibles</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
            >
              Crear el primer consejo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConsejos.map((consejo) => (
              <div key={consejo.id} className="bg-white rounded-lg p-4 md:p-5 flex items-start gap-4 border-l-4 border-primary hover:shadow-md transition">
                {/* Image Thumbnail */}
                {consejo.imagen_url && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={consejo.imagen_url}
                      alt={consejo.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 truncate">{consejo.titulo}</h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded ${
                      consejo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {consejo.activo ? '✓ Activo' : 'Borrador'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                    <span>{CONSEJO_CATEGORIES[consejo.categoria]?.icon} {CONSEJO_CATEGORIES[consejo.categoria]?.label}</span>
                    <span>•</span>
                    <span>{consejo.tipo_mascota === 'ambos' ? '🐕 🐱' : consejo.tipo_mascota === 'perro' ? '🐕' : '🐱'}</span>
                    <span>•</span>
                    <span>Edad: {consejo.edad_minima}-{consejo.edad_maxima || '∞'} años</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{consejo.contenido}</p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => handleEdit(consejo)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(consejo.id)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-sm font-semibold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg font-bold">{editingId ? 'Editar Consejo' : 'Nuevo Consejo'}</h2>
              <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Título */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Cuando castrar a tu perro"
                  className={inputCls}
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Contenido *</label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  placeholder="Escribe el consejo veterinario aquí..."
                  rows={6}
                  className={textareaCls}
                />
                <p className="text-xs text-gray-500 mt-1">Caracteres: {form.contenido.length}</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Imagen (opcional)</label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-40 mb-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-600">📸 Click para subir imagen</p>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Tipo Mascota */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Tipo de Mascota</label>
                <select
                  value={form.tipo_mascota}
                  onChange={(e) => setForm({ ...form, tipo_mascota: e.target.value as ConsejoTipoMascota })}
                  className={inputCls}
                >
                  <option value="perro">🐕 Perro</option>
                  <option value="gato">🐱 Gato</option>
                  <option value="ambos">🐕 🐱 Ambos</option>
                </select>
              </div>

              {/* Age Range */}
              <AdminAgeRangeSlider
                minAge={form.edad_minima}
                maxAge={form.edad_maxima}
                onMinChange={(value) => setForm({ ...form, edad_minima: value })}
                onMaxChange={(value) => setForm({ ...form, edad_maxima: value })}
              />

              {/* Categoría */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value as ConsejoCategoria })}
                  className={inputCls}
                >
                  {(Object.entries(CONSEJO_CATEGORIES) as [ConsejoCategoria, any][]).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Orden (para ordenar dentro de la categoría)</label>
                <input
                  type="number"
                  value={form.orden}
                  onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                  className={inputCls}
                />
              </div>

              {/* Activo Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.activo ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.activo ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {form.activo ? 'Publicado (visible en la web)' : 'Borrador (oculto)'}
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} /> {editingId ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
