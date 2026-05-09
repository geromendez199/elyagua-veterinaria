'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, Users, LogOut, ChevronRight, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Stats {
  productos_activos: number
  pedidos_pendientes: number
  total_clientes: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [stats, setStats] = useState<Stats>({ productos_activos: 0, pedidos_pendientes: 0, total_clientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/admin'); return }
      setUserEmail(data.session.user.email || '')

      const [
        { count: productosCount },
        { data: pedidos },
        { count: clientesCount },
      ] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('pedidos').select('estado'),
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
      ])

      const pendientes = (pedidos || []).filter(p => !p.estado || p.estado === 'pendiente').length

      setStats({
        productos_activos: productosCount || 0,
        pedidos_pendientes: pendientes,
        total_clientes: clientesCount || 0,
      })
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const secciones = [
    {
      href: '/admin/productos',
      icon: Package,
      titulo: 'Productos',
      descripcion: 'Administrá el catálogo, precios, stock e imágenes',
      stat: stats.productos_activos,
      statLabel: 'productos activos',
      color: 'from-primary to-primary-dark',
      badge: null,
    },
    {
      href: '/admin/pedidos',
      icon: ShoppingBag,
      titulo: 'Pedidos',
      descripcion: 'Confirmá, cancelá y seguí el estado de cada pedido',
      stat: stats.pedidos_pendientes,
      statLabel: 'pendientes',
      color: 'from-orange-400 to-orange-600',
      badge: stats.pedidos_pendientes > 0 ? stats.pedidos_pendientes : null,
    },
    {
      href: '/admin/clientes',
      icon: Users,
      titulo: 'Clientes',
      descripcion: 'Consultá el historial, pedidos y notas de cada cliente',
      stat: stats.total_clientes,
      statLabel: 'registrados',
      color: 'from-violet-500 to-violet-700',
      badge: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-color.png" alt="El Yagua" width={120} height={60} className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-gray-200 pl-3">
              <p className="text-xs text-gray-400">Panel de administración</p>
              <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{userEmail}</p>
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

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bienvenida 👋</h1>
          <p className="text-gray-500 mt-1">¿Qué querés administrar hoy?</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {secciones.map(({ href, icon: Icon, titulo, descripcion, stat, statLabel, color, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Badge de notificación */}
              {badge !== null && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                  {badge}
                </div>
              )}

              {/* Franja de color */}
              <div className={`h-2 bg-gradient-to-r ${color}`} />

              <div className="p-6">
                {/* Ícono */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>

                {/* Título y descripción */}
                <h2 className="text-lg font-bold text-gray-900 mb-1">{titulo}</h2>
                <p className="text-sm text-gray-500 leading-snug mb-5">{descripcion}</p>

                {/* Stat */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{statLabel}</p>
                  </div>
                  <div className="w-9 h-9 bg-gray-100 group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Acceso rápido pedidos pendientes */}
        {stats.pedidos_pendientes > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <Clock size={18} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700 font-medium flex-1">
              Tenés <strong>{stats.pedidos_pendientes} pedido{stats.pedidos_pendientes > 1 ? 's' : ''} pendiente{stats.pedidos_pendientes > 1 ? 's' : ''}</strong> por confirmar.
            </p>
            <Link href="/admin/pedidos?filtro=pendiente" className="text-sm font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap">
              Ver ahora →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
