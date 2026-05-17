'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, Users, LogOut, ChevronRight, Clock, TrendingUp, TrendingDown, Minus, BarChart2, CreditCard, AlertTriangle, BookOpen, Star } from 'lucide-react'
import LazyImage from '@/components/LazyImage'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Stats {
  productos_activos: number
  pedidos_pendientes: number
  total_clientes: number
}

interface MesStats {
  ventas: number
  ventas_anterior: number
  pedidos: number
  pedidos_anterior: number
  ticket_promedio: number
}

interface TopProducto {
  nombre: string
  cantidad: number
}

function Tendencia({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0) return null
  const pct = Math.round(((actual - anterior) / anterior) * 100)
  if (pct === 0) return <span className="flex items-center gap-0.5 text-xs text-gray-400"><Minus size={12} />0%</span>
  if (pct > 0) return <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold"><TrendingUp size={12} />+{pct}% vs mes anterior</span>
  return <span className="flex items-center gap-0.5 text-xs text-red-500 font-semibold"><TrendingDown size={12} />{pct}% vs mes anterior</span>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState<Stats>({ productos_activos: 0, pedidos_pendientes: 0, total_clientes: 0 })
  const [mes, setMes] = useState<MesStats>({ ventas: 0, ventas_anterior: 0, pedidos: 0, pedidos_anterior: 0, ticket_promedio: 0 })
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [stockBajo, setStockBajo] = useState<{ id: string; nombre: string; stock: number }[]>([])
  const [cuponesActivos, setCuponesActivos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/admin'); return }
      const email = data.session.user.email || ''
      setUserEmail(email)

      // Buscar nombre del usuario en tabla de administradores
      try {
        const { data: adminData } = await supabase
          .from('administradores')
          .select('nombre')
          .eq('email', email)
          .single()
        if (adminData?.nombre) {
          setUserName(adminData.nombre)
        }
      } catch {
        // Si no existe en tabla, usar el email como fallback
        setUserName(email)
      }

      const [
        { count: productosCount },
        { data: pedidos },
        { count: clientesCount },
        { data: lowStock },
        { count: cuponesCount },
      ] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('pedidos').select('estado, total, productos, created_at'),
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('id, nombre, stock').eq('activo', true).lt('stock', 5).order('stock', { ascending: true }).limit(10),
        supabase.from('cupones').select('*', { count: 'exact', head: true }).eq('activo', true),
      ])
      setStockBajo(lowStock || [])
      setCuponesActivos(cuponesCount || 0)

      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      const inicioMesAnt = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
      const finMesAnt = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)

      const validos = (pedidos || []).filter(p => p.estado !== 'cancelado')
      const delMes = validos.filter(p => new Date(p.created_at) >= inicioMes)
      const delMesAnt = validos.filter(p => {
        const d = new Date(p.created_at)
        return d >= inicioMesAnt && d <= finMesAnt
      })

      const ventasMes = delMes.reduce((s, p) => s + (p.total || 0), 0)
      const ventasMesAnt = delMesAnt.reduce((s, p) => s + (p.total || 0), 0)

      // Top productos (todos los tiempos, pedidos no cancelados)
      const conteo: Record<string, number> = {}
      for (const pedido of validos) {
        for (const prod of (pedido.productos || [])) {
          conteo[prod.nombre] = (conteo[prod.nombre] || 0) + (prod.cantidad || 1)
        }
      }
      const top = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))

      setStats({
        productos_activos: productosCount || 0,
        pedidos_pendientes: validos.filter(p => !p.estado || p.estado === 'pendiente').length,
        total_clientes: clientesCount || 0,
      })
      setMes({
        ventas: ventasMes,
        ventas_anterior: ventasMesAnt,
        pedidos: delMes.length,
        pedidos_anterior: delMesAnt.length,
        ticket_promedio: delMes.length > 0 ? ventasMes / delMes.length : 0,
      })
      setTopProductos(top)
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

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
      descripcion: 'Catálogo, precios, stock e imágenes',
      stat: stats.productos_activos,
      statLabel: 'activos',
      color: 'from-primary to-primary-dark',
      badge: null,
    },
    {
      href: '/admin/pedidos',
      icon: ShoppingBag,
      titulo: 'Pedidos',
      descripcion: 'Confirmá y seguí cada pedido',
      stat: stats.pedidos_pendientes,
      statLabel: 'pendientes',
      color: 'from-orange-400 to-orange-600',
      badge: stats.pedidos_pendientes > 0 ? stats.pedidos_pendientes : null,
    },
    {
      href: '/admin/clientes',
      icon: Users,
      titulo: 'Clientes',
      descripcion: 'Historial, pedidos y notas',
      stat: stats.total_clientes,
      statLabel: 'registrados',
      color: 'from-violet-500 to-violet-700',
      badge: null,
    },
    {
      href: '/admin/yaguamillas-control',
      icon: Star,
      titulo: 'YaguaMillas',
      descripcion: 'Clientes, cupones, hitos y descuentos',
      stat: cuponesActivos,
      statLabel: 'cupones disponibles',
      color: 'from-amber-400 to-yellow-500',
      badge: null,
    },
    {
      href: '/admin/info',
      icon: BookOpen,
      titulo: 'Consejos Veterinarios',
      descripcion: 'Artículos, tips e infografías',
      stat: null,
      statLabel: '',
      color: 'from-teal-400 to-teal-600',
      badge: null,
    },
  ]

  const maxCantidad = topProductos[0]?.cantidad || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LazyImage src="/logo-color.png" alt="El Yagua" width={120} height={60} className="h-10 w-auto" />
            <Link href="/admin/perfil" className="hidden sm:block border-l border-gray-200 pl-3 hover:opacity-70 transition">
              <p className="text-xs text-gray-400">Panel de administración</p>
              <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{userName || userEmail}</p>
            </Link>
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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Bienvenida */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-500 mt-1">¿Qué querés administrar hoy?</p>
        </div>

        {/* Cards de secciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secciones.map(({ href, icon: Icon, titulo, descripcion, stat, statLabel, color, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {badge !== null && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                  {badge}
                </div>
              )}
              <div className={`h-1.5 bg-gradient-to-r ${color}`} />
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-0.5">{titulo}</h2>
                <p className="text-xs text-gray-500 mb-4">{descripcion}</p>
                <div className="flex items-end justify-between">
                  <div>
                    {stat !== null && <p className="text-2xl font-bold text-gray-900">{stat}</p>}
                    {statLabel && <p className="text-xs text-gray-400">{statLabel}</p>}
                  </div>
                  <div className="w-8 h-8 bg-gray-100 group-hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Estadísticas del mes ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900 capitalize">
              Estadísticas — {mesActual}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Ventas del mes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={15} className="text-primary" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ventas del mes</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(mes.ventas)}</p>
              <div className="mt-1">
                <Tendencia actual={mes.ventas} anterior={mes.ventas_anterior} />
              </div>
            </div>

            {/* Pedidos del mes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={15} className="text-orange-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedidos del mes</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{mes.pedidos}</p>
              <div className="mt-1">
                <Tendencia actual={mes.pedidos} anterior={mes.pedidos_anterior} />
              </div>
            </div>

            {/* Ticket promedio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-violet-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ticket promedio</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(mes.ticket_promedio)}</p>
              <p className="text-xs text-gray-400 mt-1">por pedido este mes</p>
            </div>
          </div>
        </div>

        {/* ── Productos más pedidos ── */}
        {topProductos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Productos más pedidos</h2>
              <span className="text-xs text-gray-400 ml-1">todos los tiempos</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {topProductos.map((p, i) => (
                <div
                  key={p.nombre}
                  className={`px-5 py-4 flex items-center gap-4 ${i < topProductos.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {/* Posición */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-white' :
                    i === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>

                  {/* Nombre + barra */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate mb-1.5">{p.nombre}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((p.cantidad / maxCantidad) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{p.cantidad}</p>
                    <p className="text-xs text-gray-400">unid.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerta stock bajo */}
        {stockBajo.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {stockBajo.filter(p => p.stock === 0).length > 0
                    ? 'Productos sin stock o con stock crítico'
                    : 'Productos con stock bajo'}
                </h3>
              </div>
              <Link href="/admin/productos" className="text-xs font-semibold text-primary hover:underline">
                Gestionar →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stockBajo.map((p) => (
                <div key={p.id} className="px-5 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate mr-4">{p.nombre}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    p.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock === 0 ? 'Sin stock' : `${p.stock} unid.`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerta pedidos pendientes */}
        {stats.pedidos_pendientes > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <Clock size={18} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700 font-medium flex-1">
              Tenés <strong>{stats.pedidos_pendientes} pedido{stats.pedidos_pendientes > 1 ? 's' : ''} pendiente{stats.pedidos_pendientes > 1 ? 's' : ''}</strong> por confirmar.
            </p>
            <Link href="/admin/pedidos" className="text-sm font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap">
              Ver ahora →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
