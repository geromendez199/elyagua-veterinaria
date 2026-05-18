'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria } from '@/types'
import { ArrowLeft, Plus, Trash2, Edit2, LogOut, BookOpen, Eye, EyeOff, Upload, Camera, Loader2 } from 'lucide-react'
import LazyImage from '@/components/LazyImage'
import Link from 'next/link'

const CATEGORIAS: ArticuloCategoria[] = ['Nutrición', 'Salud', 'Prevención', 'Cuidados', 'General']

const inputCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 bg-white text-sm'
const textareaCls = 'w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none text-gray-900 bg-white text-sm resize-none'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const emptyForm = {
  titulo: '',
  slug: '',
  contenido: '',
  imagen_url: '',
  categoria: 'General' as ArticuloCategoria,
  tipo_mascota: null as string | null,
  veterinario_autor: '',
  activo: true,
}

export default function AdminInfoPage() {
  const router = useRouter()
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const fetchArticulos = async () => {
    try {
      const { data } = await supabase
        .from('articulos')
        .select('*')
        .order('created_at', { ascending: false })
      setArticulos(data || [])
    } catch {
      showToast('Error cargando consejos')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      fetchArticulos()
    })
  }, [])

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
  }

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (art: Articulo) => {
    setEditingId(art.id)
    setForm({
      titulo: art.titulo,
      slug: art.slug,
      contenido: art.contenido,
      imagen_url: art.imagen_url || '',
      categoria: art.categoria,
      tipo_mascota: (art as any).tipo_mascota || null,
      veterinario_autor: (art as any).veterinario_autor || '',
      activo: art.activo,
    })
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const handleTituloChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      titulo: v,
      ...(editingId === null ? { slug: toSlug(v) } : {}),
    }))
  }

  // Extract storage path from public URL
  const storageFilename = (url: string): string | null => {
    const match = url.match(/\/storage\/v1\/object\/public\/consejos\/(.+)/)
    return match ? match[1] : null
  }

  const deleteStorageFile = (url: string) => {
    const filename = storageFilename(url)
    if (filename) supabase.storage.from('consejos').remove([filename])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      showToast('El título y el texto son obligatorios')
      return
    }
    setSaving(true)

    try {
      let imagen_url = form.imagen_url

      // Upload new image if one was selected
      if (imageFile) {
        setUploadingImage(true)
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('consejos')
          .upload(filename, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('consejos').getPublicUrl(filename)
        // Delete old image in background
        if (editingId && form.imagen_url) deleteStorageFile(form.imagen_url)
        imagen_url = urlData.publicUrl
        setUploadingImage(false)
      }

      // Auto-generate resumen from the first paragraph (max 200 chars)
      const resumen = form.contenido.split('\n\n')[0].slice(0, 200).trimEnd()

      const payload: any = {
        titulo: form.titulo.trim(),
        slug: form.slug.trim() || toSlug(form.titulo),
        resumen,
        contenido: form.contenido.trim(),
        imagen_url: imagen_url || null,
        autor: 'El Yagua Veterinaria',
        categoria: form.categoria,
        activo: form.activo,
        updated_at: new Date().toISOString(),
      }

      // Solo agregar campos opcionales si tienen valor
      if (form.tipo_mascota) payload.tipo_mascota = form.tipo_mascota
      if (form.veterinario_autor?.trim()) payload.veterinario_autor = form.veterinario_autor.trim()

      if (editingId) {
        const { error } = await supabase.from('articulos').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('Consejo actualizado ✓')
      } else {
        const { error } = await supabase.from('articulos').insert([payload])
        if (error) throw error
        showToast('Consejo publicado ✓')
      }

      closeModal()
      await fetchArticulos()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as any).message) : String(err)
      showToast('Error: ' + (errorMsg || 'Error desconocido'))
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  const toggleActivo = async (art: Articulo) => {
    try {
      await supabase.from('articulos').update({ activo: !art.activo }).eq('id', art.id)
      setArticulos(prev => prev.map(a => a.id === art.id ? { ...a, activo: !a.activo } : a))
    } catch {
      showToast('Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este consejo? No se puede deshacer.')) return
    try {
      const art = articulos.find(a => a.id === id)
      const { error } = await supabase.from('articulos').delete().eq('id', id)
      if (error) throw error
      if (art?.imagen_url) deleteStorageFile(art.imagen_url)
      setArticulos(prev => prev.filter(a => a.id !== id))
      showToast('Consejo eliminado')
    } catch {
      showToast('Error al eliminar')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  // The image to show in the modal: new preview or existing URL
  const currentImage = imagePreview ?? (form.imagen_url || null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-sm font-medium animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-white/10 p-2 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen size={20} />
            <h1 className="text-xl font-bold">Consejos Veterinarios</h1>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {articulos.length} consejo{articulos.length !== 1 ? 's' : ''} publicado{articulos.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition text-sm"
          >
            <Plus size={16} /> Nuevo consejo
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando…</div>
        ) : articulos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay consejos todavía. ¡Creá el primero!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articulos.map((art) => (
              <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                {/* Miniatura */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                  {art.imagen_url ? (
                    <LazyImage
                      src={art.imagen_url}
                      alt={art.titulo}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      objectFit="contain"
                    />
                  ) : (
                    <BookOpen size={20} className="text-gray-300" />
                  )}
                </div>

                {/* Estado + info */}
                <div className="w-1.5 h-1.5 rounded-full shrink-0 self-start mt-2.5 hidden sm:block"
                  style={{ backgroundColor: art.activo ? '#4ade80' : '#d1d5db' }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{art.categoria}</span>
                    {!art.activo && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Borrador</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate text-sm">{art.titulo}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{art.resumen}</p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActivo(art)}
                    title={art.activo ? 'Pasar a borrador' : 'Publicar'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
                  >
                    {art.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(art)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition text-gray-400 hover:text-primary"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar consejo' : 'Nuevo consejo'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition">✕</button>
            </div>

            <div className="p-6 space-y-5">

              {/* ── Imagen upload ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen / Infografía
                  <span className="text-gray-400 font-normal ml-1">(aparece al costado del texto · sin recorte)</span>
                </label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition overflow-hidden group"
                >
                  {currentImage ? (
                    <div className="relative">
                      <LazyImage
                        src={currentImage}
                        alt="preview"
                        width={600}
                        height={400}
                        className="w-full max-h-72 object-contain bg-gray-50"
                        objectFit="contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-xl">
                        <Camera size={22} className="text-white" />
                        <span className="text-white text-sm font-semibold">Cambiar imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <Upload size={36} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Clic para subir una imagen</p>
                      <p className="text-xs mt-1 opacity-70">JPG · PNG · WEBP — infografías, tablas, fotos</p>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2 rounded-xl">
                      <Loader2 size={24} className="text-primary animate-spin" />
                      <span className="text-sm text-primary font-semibold">Subiendo imagen…</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Título ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título del consejo *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleTituloChange(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: ¿Cuánto debe comer tu cachorro según su edad y peso?"
                />
              </div>

              {/* ── Categoría ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm(prev => ({ ...prev, categoria: e.target.value as ArticuloCategoria }))}
                  className={inputCls}
                >
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* ── Tipo de Mascota ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Para qué mascota</label>
                <select
                  value={form.tipo_mascota || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, tipo_mascota: e.target.value || null }))}
                  className={inputCls}
                >
                  <option value="">Seleccionar (opcional)</option>
                  <option value="perro">Perros</option>
                  <option value="gato">Gatos</option>
                  <option value="ambos">Perros y Gatos</option>
                </select>
              </div>

              {/* ── Veterinario Autor ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Veterinario autor</label>
                <input
                  type="text"
                  value={form.veterinario_autor}
                  onChange={(e) => setForm(prev => ({ ...prev, veterinario_autor: e.target.value }))}
                  className={inputCls}
                  placeholder="Ej: Dra. María González (opcional)"
                />
              </div>

              {/* ── Contenido ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Texto del consejo *
                  <span className="text-gray-400 font-normal text-xs ml-1">(separá párrafos con una línea en blanco)</span>
                </label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm(prev => ({ ...prev, contenido: e.target.value }))}
                  className={textareaCls}
                  rows={10}
                  placeholder={"Una pregunta frecuente es cuánto debe comer mi cachorro...\n\nEn esta tabla damos un aproximado basándonos en edad y % de peso.\n\nRazas grandes se ajustarán al % menor y razas pequeñas al % mayor."}
                />
              </div>

              {/* ── Activo ── */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm(prev => ({ ...prev, activo: !prev.activo }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.activo ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {form.activo ? 'Publicado (visible en la web)' : 'Borrador (oculto)'}
                </span>
              </label>

            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition disabled:opacity-60 flex items-center gap-2 min-w-[150px] justify-center"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                ) : (
                  editingId ? 'Guardar cambios' : 'Publicar consejo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
