'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ArrowLeft, LogOut, User, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AdminPerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin'); return }
    setUser(user)
    setDisplayName(user.user_metadata?.full_name || '')
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      showToast('El nombre no puede estar vacío')
      return
    }

    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { full_name: displayName }
      })
      showToast('Nombre actualizado')
      window.location.reload()
    } catch (err: any) {
      showToast('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Completa ambos campos')
      return
    }
    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden')
      return
    }

    setSaving(true)
    try {
      await supabase.auth.updateUser({
        password: newPassword
      })
      showToast('Contraseña actualizada')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      showToast('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando...</p>
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
            <User size={22} />
            Mi Perfil
          </h1>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
            {toast}
          </div>
        )}

        {/* Email Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Correo Electrónico
          </h2>
          <p className="text-gray-600 break-all">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">No se puede cambiar el correo desde aquí</p>
        </div>

        {/* Display Name Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Nombre para Mostrar
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
            />
            <p className="text-sm text-gray-500">Este nombre aparecerá en el panel de administración</p>
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            Cambiar Contraseña
          </h2>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
            />
            <p className="text-sm text-gray-500">Mínimo 6 caracteres</p>
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
