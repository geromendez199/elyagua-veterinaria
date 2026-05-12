'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ArrowLeft, LogOut, BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'

interface Pedido {
  id: string
  total: number
  estado: string
  zona: string
  created_at: string
  productos: { nombre: string; cantidad: number; precio: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin'); return }
    await fetchData()
  }

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })
      const allPedidos = data || []
      setPedidos(allPedidos)

      const ahora = new Date()
      const ultimos12Meses = []
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        ultimos12Meses.push(fecha)
      }

      const valisPedidos = allPedidos.filter(p => p.estado !== 'cancelado')

      const ventasPorMes = ultimos12Meses.map(fecha => {
        const mes = fecha.getMonth()
        const year = fecha.getFullYear()
        const total = valisPedidos
          .filter(p => {
            const d = new Date(p.created_at)
            return d.getMonth() === mes && d.getFullYear() === year
          })
          .reduce((s, p) => s + (p.total || 0), 0)
        return { mes: fecha.toLocaleDateString('es-AR', { month: 'short' }), total }
      })

      const productoCounts: Record<string, { nombre: string; cantidad: number; total: number }> = {}
      for (const p of valisPedidos) {
        for (const prod of p.productos || []) {
          if (!productoCounts[prod.nombre]) {
            productoCounts[prod.nombre] = { nombre: prod.nombre, cantidad: 0, total: 0 }
          }
          productoCounts[prod.nombre].cantidad += prod.cantidad
          productoCounts[prod.nombre].total += (prod.precio * prod.cantidad)
        }
      }
      const topProductos = Object.values(productoCounts).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)

      const zonaStats: Record<string, number> = {}
      for (const p of valisPedidos) {
        if (p.zona) {
          zonaStats[p.zona] = (zonaStats[p.zona] || 0) + p.total
        }
      }

      const estadoStats: Record<string, number> = {}
      for (const p of valisPedidos) {
        const estado = p.estado || 'pendiente'
        estadoStats[estado] = (estadoStats[estado] || 0) + 1
      }

      setStats({
        ventasPorMes,
        topProductos,
        zonaStats,
        estadoStats,
        totalVentas: valisPedidos.reduce((s, p) => s + (p.total || 0), 0),
        totalPedidos: valisPedidos.length,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando analíticas...</p>
    </div>
  )

  if (!stats) return null

  const maxVenta = Math.max(...stats.ventasPorMes.map((d: any) => d.total))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 size={22} />
            Analíticas
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-primary" />
              <p className="text-sm text-gray-500 font-semibold">Ventas Totales</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalVentas)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} className="text-orange-500" />
              <p className="text-sm text-gray-500 font-semibold">Pedidos</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPedidos}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-violet-500" />
              <p className="text-sm text-gray-500 font-semibold">Ticket Promedio</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(stats.totalPedidos > 0 ? stats.totalVentas / stats.totalPedidos : 0)}
            </p>
          </div>
        </div>

        {/* Ventas por mes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Ventas Últimos 12 Meses</h2>
          <div className="flex items-end justify-between h-64 gap-2">
            {stats.ventasPorMes.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden flex flex-col-reverse">
                  <div
                    className="w-full bg-primary transition-all"
                    style={{ height: maxVenta > 0 ? `${(d.total / maxVenta) * 100}%` : '2px' }}
                  />
                </div>
                <span className="text-xs text-gray-500 text-center truncate">{d.mes}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos más vendidos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Productos</h2>
            <div className="space-y-3">
              {stats.topProductos.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.cantidad} unidades · {formatPrice(p.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ventas por zona */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ventas por Zona</h2>
            <div className="space-y-3">
              {Object.entries(stats.zonaStats).map(([zona, total]: [string, any]) => {
                const porcentaje = (total / stats.totalVentas) * 100
                return (
                  <div key={zona}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900 capitalize">{zona}</span>
                      <span className="text-sm text-gray-500">{formatPrice(total)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Estado de pedidos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Distribución de Estados</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.estadoStats).map(([estado, count]: [string, any]) => {
                const colores: Record<string, string> = {
                  pendiente: 'bg-yellow-100 text-yellow-800',
                  confirmado: 'bg-blue-100 text-blue-800',
                  enviado: 'bg-cyan-100 text-cyan-800',
                  entregado: 'bg-green-100 text-green-800',
                  cancelado: 'bg-red-100 text-red-700',
                }
                return (
                  <div key={estado} className="text-center">
                    <p className={`text-sm font-bold px-3 py-1 rounded capitalize inline-block ${colores[estado] || 'bg-gray-100 text-gray-700'}`}>
                      {estado}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
