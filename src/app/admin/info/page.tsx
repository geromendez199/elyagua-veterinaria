'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria } from '@/types'
import { ArrowLeft, Plus, Trash2, Edit2, LogOut, BookOpen, Eye, EyeOff } from 'lucide-react'
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
  resumen: '',
  contenido: '',
  imagen_url: '',
  autor: 'El Yagua Veterinaria',
  categoria: 'General' as ArticuloCategoria,
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
    } catch (err: unknown) {
      showToast('Error cargando artículos: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin'); return }
    await fetchArticulos()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { checkAuth() }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (art: Articulo) => {
    setEditingId(art.id)
    setForm({
      titulo: art.titulo,
      slug: art.slug,
      resumen: art.resumen,
      contenido: art.contenido,
      imagen_url: art.imagen_url || '',
      autor: art.autor,
      categoria: art.categoria,
      activo: art.activo,
    })
    setShowModal(true)
  }

  const handleTituloChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      titulo: v,
      // sólo auto-gen slug si es artículo nuevo
      ...(editingId === null ? { slug: toSlug(v) } : {}),
    }))
  }

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.slug.trim() || !form.resumen.trim() || !form.contenido.trim()) {
      showToast('Completá todos los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        slug: form.slug.trim(),
        resumen: form.resumen.trim(),
        contenido: form.contenido.trim(),
        imagen_url: form.imagen_url.trim() || null,
        autor: form.autor.trim() || 'El Yagua Veterinaria',
        categoria: form.categoria,
        activo: form.activo,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase.from('articulos').update(payload).eq('id', editingId)
        if (error) throw error
        showToast('Artículo actualizado')
      } else {
        const { error } = await supabase.from('articulos').insert([payload])
        if (error) throw error
        showToast('Artículo creado')
      }

      setShowModal(false)
      await fetchArticulos()
    } catch (err: unknown) {
      showToast('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
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
    if (!confirm('¿Eliminar este artículo? Esta acción no se puede deshacer.')) return
    try {
      const { error } = await supabase.from('articulos').delete().eq('id', id)
      if (error) throw error
      setArticulos(prev => prev.filter(a => a.id !== id))
      showToast('Artículo eliminado')
    } catch {
      showToast('Error al eliminar')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

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
          <p className="text-gray-500 text-sm">{articulos.length} consejo{articulos.length !== 1 ? 's' : ''} publicado{articulos.length !== 1 ? 's' : ''}</p>
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
              <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                {/* Indicador activo */}
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${art.activo ? 'bg-green-400' : 'bg-gray-300'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{art.categoria}</span>
                    {!art.activo && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactivo</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{art.titulo}</h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{art.resumen}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Por {art.autor} · /info/{art.slug}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActivo(art)}
                    title={art.activo ? 'Desactivar' : 'Activar'}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar artículo' : 'Nuevo artículo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 p-1">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleTituloChange(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: Cómo alimentar a tu perro de forma saludable"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL (slug) *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: toSlug(e.target.value) }))}
                  className={inputCls}
                  placeholder="como-alimentar-a-tu-perro"
                />
                <p className="text-xs text-gray-400 mt-1">elyagua.com/info/{form.slug || '…'}</p>
              </div>

              {/* Autor y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Autor *</label>
                  <input
                    type="text"
                    value={form.autor}
                    onChange={(e) => setForm(prev => ({ ...prev, autor: e.target.value }))}
                    className={inputCls}
                    placeholder="Dr. García"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm(prev => ({ ...prev, categoria: e.target.value as ArticuloCategoria }))}
                    className={inputCls}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Imagen URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  URL de imagen <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={form.imagen_url}
                  onChange={(e) => setForm(prev => ({ ...prev, imagen_url: e.target.value }))}
                  className={inputCls}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  📌 La imagen se muestra al costado del texto (sin recorte). Ideal para infografías y tablas.
                </p>
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Resumen * <span className="text-gray-400 font-normal text-xs">(se muestra en la tarjeta)</span></label>
                <textarea
                  value={form.resumen}
                  onChange={(e) => setForm(prev => ({ ...prev, resumen: e.target.value }))}
                  className={textareaCls}
                  rows={2}
                  placeholder="Breve descripción del artículo (1-2 oraciones)"
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contenido * <span className="text-gray-400 font-normal text-xs">(separá párrafos con una línea en blanco)</span>
                </label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm(prev => ({ ...prev, contenido: e.target.value }))}
                  className={textareaCls}
                  rows={12}
                  placeholder={`Primer párrafo del artículo...\n\nSegundo párrafo...\n\nTercer párrafo...`}
                />
              </div>

              {/* Activo */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(prev => ({ ...prev, activo: !prev.activo }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.activo ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{form.activo ? 'Publicado' : 'Borrador'}</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition disabled:opacity-60"
              >
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear artículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
