'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, LogOut, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface AdminProfile {
  id?: string
  email: string
  nombre: string
  telefono?: string
  updated_at?: string
}

export default function AdminPerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AdminProfile>({ email: '', nombre: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin'); return }

      const email = session.user.email || ''
      setProfile(prev => ({ ...prev, email }))

      // Buscar perfil del admin
      try {
        const { data } = await supabase
          .from('administradores')
          .select('*')
          .eq('email', email)
          .single()

        if (data) {
          setProfile(data)
        }
      } catch {
        // Si no existe, crear registro
        await supabase.from('administradores').insert({
          email,
          nombre: email.split('@')[0],
        })
        setProfile(prev => ({ ...prev, nombre: email.split('@')[0] }))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleSave = async () => {
    if (!profile.nombre.trim()) {
      showMessage('El nombre es requerido', 'error')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('administradores')
        .upsert({
          email: profile.email,
          nombre: profile.nombre,
          telefono: profile.telefono || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' })

      if (error) throw error
      showMessage('Perfil actualizado correctamente', 'success')
    } catch (err: unknown) {
      showMessage('Error al guardar: ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleChange = (field: keyof AdminProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="hover:bg-gray-100 p-1.5 rounded-lg transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <Image src="/logo-color.png" alt="El Yagua" width={120} height={60} className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-gray-200 pl-3">
              <p className="text-xs text-gray-400">Mi Perfil</p>
              <p className="text-sm font-semibold text-gray-700">{profile.nombre}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition font-medium"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurar Perfil</h1>
            <p className="text-gray-500">Actualiza tu información personal</p>
          </div>

          <div className="space-y-5 border-t border-gray-100 pt-6">
            {/* Email (solo lectura) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">No se puede cambiar el email</p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono <span className="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                value={profile.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Tu número de teléfono"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/admin/dashboard"
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-lg hover:border-gray-300 transition text-center"
              >
                Cancelar
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
