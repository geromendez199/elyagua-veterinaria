'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import { Edit2, Trash2, LogOut, Plus, X, Upload, Camera, Loader2, ShoppingBag, AlertCircle, Users, LayoutDashboard, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

const CATEGORIAS: Category[] = ['alimentos', 'juguetes', 'medicamentos', 'accesorios']

const emptyForm = {
  nombre: '',
  descripcion: '',
  presentacion: '',
  laboratorio: '',
  precio: '',
  stock: '',
  categoria: 'alimentos' as Category,
  activo: true,
}

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900'

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // ── Modal nuevo producto ───────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const newImageRef = useRef<HTMLInputElement>(null)

  // ── Modal editar producto (completo) ──────────────────────────
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editSaveError, setEditSaveError] = useState('')
  const editImageRef = useRef<HTMLInputElement>(null)

  const [searchTerm, setSearchTerm] = useState('')

  // ── Toast de error para acciones rápidas ──────────────────────
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // ── Edición inline de stock ────────────────────────────────────
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState('')

  const saveStock = async (id: string) => {
    const newStock = parseInt(stockValue)
    if (isNaN(newStock) || newStock < 0) { setEditingStockId(null); return }
    try {
      const { error } = await supabase
        .from('productos')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: newStock } : p))
    } catch (err: any) {
      showToast('Error al actualizar stock: ' + err.message)
    } finally {
      setEditingStockId(null)
    }
  }

  // ── Cambio rápido de imagen (clic en imagen de tabla) ─────────
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
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true })
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

  // ── Extrae el path de Storage a partir de la URL pública ──────
  const storageFilename = (url: string): string | null => {
    try {
      const match = url.match(/\/storage\/v1\/object\/public\/productos\/(.+)/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const deleteStorageFile = async (url: string) => {
    const filename = storageFilename(url)
    if (filename) await supabase.storage.from('productos').remove([filename])
  }

  // ── Cambio rápido de imagen desde tabla ───────────────────────
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
      const oldUrl = products.find((p) => p.id === productId)?.imagen_url
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

      // Borrar imagen anterior de Storage
      if (oldUrl) await deleteStorageFile(oldUrl)

      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, imagen_url } : p))
    } catch (err: any) {
      showToast('Error al subir imagen: ' + err.message)
    } finally {
      setUploadingImageId(null)
      uploadTargetId.current = null
    }
  }

  // ── Nuevo producto ─────────────────────────────────────────────
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
          presentacion: form.presentacion || null,
          laboratorio: form.laboratorio || null,
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

  // ── Editar producto (modal completo) ──────────────────────────
  const openEditModal = (product: Product) => {
    setEditProduct({ ...product })
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditSaveError('')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditProduct(null)
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditSaveError('')
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    setEditSaving(true)
    setEditSaveError('')

    try {
      let imagen_url = editProduct.imagen_url

      if (editImageFile) {
        const oldUrl = editProduct.imagen_url
        const ext = editImageFile.name.split('.').pop()
        const filename = `${editProduct.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filename, editImageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(filename)
        imagen_url = urlData.publicUrl
        // Borrar imagen anterior de Storage (en background, no bloquea)
        if (oldUrl) deleteStorageFile(oldUrl)
      }

      const { error } = await supabase
        .from('productos')
        .update({
          nombre: editProduct.nombre,
          descripcion: editProduct.descripcion,
          presentacion: editProduct.presentacion || null,
          laboratorio: editProduct.laboratorio || null,
          precio: editProduct.precio,
          stock: editProduct.stock,
          categoria: editProduct.categoria,
          activo: editProduct.activo,
          imagen_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editProduct.id)
      if (error) throw error

      setProducts((prev) =>
        prev
          .map((p) => p.id === editProduct.id ? { ...editProduct, imagen_url } : p)
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      )
      closeEditModal()
    } catch (err: any) {
      setEditSaveError(err.message || 'Error al guardar')
    } finally {
      setEditSaving(false)
    }
  }

  // ── Toggle activo rápido desde la tabla ───────────────────────
  const handleToggleActivo = async (product: Product) => {
    const newActivo = !product.activo
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: newActivo, updated_at: new Date().toISOString() })
        .eq('id', product.id)
      if (error) throw error
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, activo: newActivo } : p))
    } catch (err: any) {
      showToast('Error al actualizar: ' + err.message)
    }
  }

  // ── Eliminar producto ──────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
      const product = products.find((p) => p.id === id)
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.filter((p) => p.id !== id))
      // Borrar imagen de Storage en background
      if (product?.imagen_url) deleteStorageFile(product.imagen_url)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al eliminar el producto')
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
      {/* Toast de error */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold">
          <AlertCircle size={16} />
          {toast}
        </div>
      )}

      {/* Input oculto para cambio rápido de imagen desde tabla */}
      <input
        ref={existingImageRef}
        type="file"
        accept="image/*"
        onChange={handleExistingImageChange}
        className="hidden"
      />
      {/* Input oculto para imagen en modal de edición */}
      <input
        ref={editImageRef}
        type="file"
        accept="image/*"
        onChange={handleEditImageChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold min-w-0 truncate">
            <span className="hidden sm:inline">Panel Admin — </span>El Yagua
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 sm:px-3 py-2 rounded-lg transition text-sm font-semibold"
            >
              <LayoutDashboard size={16} />
              <span className="hidden md:inline">Inicio</span>
            </Link>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 sm:px-3 py-2 rounded-lg transition text-sm font-semibold"
            >
              <ShoppingBag size={16} />
              <span className="hidden md:inline">Pedidos</span>
            </Link>
            <Link
              href="/admin/clientes"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 sm:px-3 py-2 rounded-lg transition text-sm font-semibold"
            >
              <Users size={16} />
              <span className="hidden md:inline">Clientes</span>
            </Link>
            <p className="text-sm opacity-70 hidden lg:block">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-primary-dark hover:bg-primary-light px-2.5 sm:px-3 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="flex justify-between items-center gap-3 mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Productos <span className="text-base sm:text-lg font-normal text-gray-400">({products.length})</span>
          </h2>
          <button
            onClick={() => { setShowModal(true); setSaveError('') }}
            className="flex items-center gap-1.5 bg-primary text-white font-bold px-3 sm:px-5 py-2 rounded-lg hover:bg-primary-dark transition text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary transition bg-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Mobile: Cards */}
        <div className="block md:hidden space-y-2">
          {products.filter(p => !searchTerm || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex gap-3 items-start">
              <button
                onClick={() => triggerImageUpload(product.id)}
                className="relative group w-14 h-14 rounded-lg overflow-hidden shrink-0"
                title="Clic para cambiar imagen"
              >
                {uploadingImageId === product.id ? (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Loader2 size={18} className="text-primary animate-spin" />
                  </div>
                ) : product.imagen_url ? (
                  <>
                    <Image src={product.imagen_url} alt={product.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                      <Camera size={14} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-primary group-hover:bg-primary/5 transition">
                    <Upload size={14} className="text-gray-400 group-hover:text-primary" />
                  </div>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{product.nombre}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{product.categoria}</span>
                  <span className="font-bold text-primary text-sm">{formatPrice(product.precio)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {editingStockId === product.id ? (
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      onBlur={() => saveStock(product.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveStock(product.id)
                        if (e.key === 'Escape') setEditingStockId(null)
                      }}
                      className="w-20 text-center border-2 border-primary rounded-lg px-1 py-0.5 text-sm font-bold outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditingStockId(product.id); setStockValue(String(product.stock)) }}
                      title="Clic para editar stock"
                      className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock < LOW_STOCK_THRESHOLD ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Stock: {product.stock}
                      {product.stock === 0 && ' ✕'}
                      {product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD && ' ⚠'}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleActivo(product)}
                    title={product.activo ? 'Clic para desactivar' : 'Clic para activar'}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                      product.activo
                        ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    {product.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition"
                  title="Editar"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow text-gray-400">
              <p>No hay productos todavía.</p>
            </div>
          )}
        </div>

        {/* Desktop: Tabla */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
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
              {products.filter(p => !searchTerm || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  {/* Imagen — clic para cambio rápido */}
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

                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(product.precio)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {editingStockId === product.id ? (
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={stockValue}
                        onChange={(e) => setStockValue(e.target.value)}
                        onBlur={() => saveStock(product.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStock(product.id)
                          if (e.key === 'Escape') setEditingStockId(null)
                        }}
                        className="w-16 text-center border-2 border-primary rounded-lg px-1 py-0.5 text-sm font-bold outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingStockId(product.id); setStockValue(String(product.stock)) }}
                        title="Clic para editar stock"
                        className={`font-bold px-2 py-0.5 rounded text-sm hover:ring-2 hover:ring-primary/40 transition ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock < LOW_STOCK_THRESHOLD
                            ? 'bg-orange-100 text-orange-700'
                            : 'text-gray-900'
                        }`}
                      >
                        {product.stock}
                        {product.stock === 0 && ' ✕'}
                        {product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD && ' ⚠'}
                      </button>
                    )}
                  </td>

                  {/* Activo — toggle rápido */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActivo(product)}
                      title={product.activo ? 'Clic para desactivar' : 'Clic para activar'}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        product.activo
                          ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-800'
                      }`}
                    >
                      {product.activo ? 'Sí' : 'No'}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Editar producto"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
          💡 Clic en la imagen para cambiarla rápido · Clic en Activo para activar/desactivar · Lápiz para editar todo
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Modal NUEVO producto
      ══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Nuevo producto</h3>
              <button
                onClick={() => { setShowModal(false); setImagePreview(null); setForm(emptyForm) }}
                className="text-gray-400 hover:text-gray-600"
              >
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
                  className={inputCls}
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
                  className={`${inputCls} resize-none`}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              {/* Presentación y Laboratorio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Presentación</label>
                  <input
                    type="text"
                    value={form.presentacion}
                    onChange={(e) => setForm({ ...form, presentacion: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: 450 ml, 100g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Laboratorio</label>
                  <input
                    type="text"
                    value={form.laboratorio}
                    onChange={(e) => setForm({ ...form, laboratorio: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Babs, Holliday"
                  />
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className={inputCls}
                    placeholder="0"
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
                    className={inputCls}
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
                  className={inputCls}
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

      {/* ══════════════════════════════════════════════════════════════
          Modal EDITAR producto (completo)
      ══════════════════════════════════════════════════════════════ */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Editar producto</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editSaveError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {editSaveError}
                </div>
              )}

              {/* Imagen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen del producto</label>
                <div
                  onClick={() => editImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition"
                >
                  {editImagePreview ? (
                    <div>
                      <Image src={editImagePreview} alt="preview" width={200} height={200} className="mx-auto max-h-40 w-auto object-contain rounded" />
                      <p className="text-xs text-primary mt-2">Nueva imagen seleccionada — clic para cambiar</p>
                    </div>
                  ) : editProduct.imagen_url ? (
                    <div>
                      <Image src={editProduct.imagen_url} alt={editProduct.nombre} width={200} height={200} className="mx-auto max-h-40 w-auto object-contain rounded" />
                      <p className="text-xs text-gray-400 mt-2">Clic para cambiar la imagen</p>
                    </div>
                  ) : (
                    <div className="py-4 text-gray-400">
                      <Upload size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Hacé clic para subir una imagen</p>
                      <p className="text-xs mt-1">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={editProduct.nombre}
                  onChange={(e) => setEditProduct({ ...editProduct, nombre: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editProduct.descripcion || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, descripcion: e.target.value })}
                  className={`${inputCls} resize-none`}
                  rows={3}
                />
              </div>

              {/* Presentación y Laboratorio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Presentación</label>
                  <input
                    type="text"
                    value={editProduct.presentacion || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, presentacion: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: 450 ml, 100g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Laboratorio</label>
                  <input
                    type="text"
                    value={editProduct.laboratorio || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, laboratorio: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Babs, Holliday"
                  />
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    value={editProduct.precio}
                    onChange={(e) => setEditProduct({ ...editProduct, precio: parseFloat(e.target.value) || 0 })}
                    className={inputCls}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                    className={inputCls}
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría *</label>
                <select
                  value={editProduct.categoria}
                  onChange={(e) => setEditProduct({ ...editProduct, categoria: e.target.value as Category })}
                  className={inputCls}
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
                  id="editActivo"
                  checked={editProduct.activo}
                  onChange={(e) => setEditProduct({ ...editProduct, activo: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="editActivo" className="text-sm font-semibold text-gray-700">
                  Mostrar en la tienda
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {editSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
