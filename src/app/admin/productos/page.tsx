'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import { Edit2, Trash2, LogOut, Plus, X, Upload, ImageIcon, Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

const CATEGORIAS: Category[] = ['alimentos', 'juguetes', 'remedios', 'accesorios']

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: 'alimentos' as Category,
  activo: true,
}

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Modal nuevo producto
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const newImageRef = useRef<HTMLInputElement>(null)

  // Edición inline precio/stock
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ precio: 0, stock: 0 })

  // Subida de imagen a producto existente
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)
  const existingImageRef = useRef<HTMLInputElement>(null)
  const uploadTargetId = useRef<string | null>(null)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) { router.push('/admin'); return }
    setUser(data.session.user)
    fetchProducts()
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true })
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  // ── Subir imagen a producto existente ──────────────────────────
  const triggerImageUpload = (productId: string) => {
    uploadTargetId.current = productId
    existingImageRef.current?.click()
  }

  const handleExistingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const productId = uploadTargetId.current
    if (!file || !productId) return

    setUploadingImageId(productId)
    e.target.value = ''

    try {
      const ext = file.name.split('.').pop()
      const filename = `${productId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filename, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filename)
      const imagen_url = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('productos')
        .update({ imagen_url, updated_at: new Date().toISOString() })
        .eq('id', productId)
      if (updateError) throw updateError

      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, imagen_url } : p))
    } catch (err: any) {
      alert('Error al subir imagen: ' + err.message)
    } finally {
      setUploadingImageId(null)
      uploadTargetId.current = null
    }
  }

  // ── Nuevo producto ──────────────────────────────────────────────
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')

    try {
      let imagen_url = ''
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const filename = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filename, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filename)
        imagen_url = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([{
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock),
          categoria: form.categoria,
          imagen_url,
          activo: form.activo,
        }])
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setShowModal(false)
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  // ── Edición inline precio/stock ────────────────────────────────
  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues({ precio: product.precio, stock: product.stock })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ precio: editValues.precio, stock: editValues.stock, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...editValues } : p))
      setEditingId(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Input oculto para subir foto a producto existente */}
      <input
        ref={existingImageRef}
        type="file"
        accept="image/*"
        onChange={handleExistingImageChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel Admin — El Yagua</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm opacity-80">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-primary-dark hover:bg-primary-light px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Productos <span className="text-lg font-normal text-gray-400">({products.length})</span>
          </h2>
          <button
            onClick={() => { setShowModal(true); setSaveError('') }}
            className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            <Plus size={20} />
            Nuevo producto
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Imagen</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoría</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Activo</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  {/* Celda imagen — clic para cambiar foto */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => triggerImageUpload(product.id)}
                      className="relative group w-14 h-14 rounded-lg overflow-hidden block"
                      title="Clic para cambiar imagen"
                    >
                      {uploadingImageId === product.id ? (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Loader2 size={20} className="text-primary animate-spin" />
                        </div>
                      ) : product.imagen_url ? (
                        <>
                          <Image
                            src={product.imagen_url}
                            alt={product.nombre}
                            width={56}
                            height={56}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                            <Camera size={16} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-1 group-hover:bg-primary/10 transition border-2 border-dashed border-gray-300 group-hover:border-primary">
                          <Upload size={14} className="text-gray-400 group-hover:text-primary" />
                          <span className="text-[9px] text-gray-400 group-hover:text-primary">Subir</span>
                        </div>
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-gray-900 font-medium">{product.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                      {product.categoria}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValues.precio}
                        onChange={(e) => setEditValues({ ...editValues, precio: parseFloat(e.target.value) })}
                        className="w-24 border rounded px-2 py-1 text-center text-gray-900"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">${product.precio.toFixed(2)}</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValues.stock}
                        onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) })}
                        className="w-20 border rounded px-2 py-1 text-center text-gray-900"
                      />
                    ) : (
                      <span className="text-gray-900 font-medium">{product.stock}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.activo ? 'Sí' : 'No'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleSaveEdit(product.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar precio/stock">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No hay productos todavía.</p>
              <p className="text-sm mt-1">Usá el botón "Nuevo producto" para agregar el primero.</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          💡 Hacé clic en la imagen de cualquier producto para subir o cambiar su foto
        </p>
      </div>

      {/* ── Modal nuevo producto ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Nuevo producto</h3>
              <button onClick={() => { setShowModal(false); setImagePreview(null); setForm(emptyForm) }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {saveError}
                </div>
              )}

              {/* Imagen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen del producto</label>
                <div
                  onClick={() => newImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition"
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="preview" width={200} height={200} className="mx-auto max-h-40 w-auto object-contain rounded" />
                  ) : (
                    <div className="py-4 text-gray-400">
                      <Upload size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Hacé clic para subir una imagen</p>
                      <p className="text-xs mt-1">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input ref={newImageRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900"
                  placeholder="Ej: Royal Canin Adult 15kg"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none resize-none text-gray-900"
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value as Category })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900"
                  required
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Activo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="activo" className="text-sm font-semibold text-gray-700">
                  Mostrar en la tienda
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setImagePreview(null); setForm(emptyForm) }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
