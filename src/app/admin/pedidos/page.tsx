import { Suspense } from 'react'
import AdminPedidosContent from './AdminPedidosContent'

export const dynamic = 'force-dynamic'

export default function AdminPedidosPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast: nuevo pedido */}
      {nuevoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-pulse">
          <Bell size={16} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="hover:bg-primary-dark p-1.5 rounded-lg transition shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 min-w-0">
            <ShoppingBag size={22} className="shrink-0" />
            Pedidos
          </h1>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              href="/admin/clientes"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 sm:px-3 py-1.5 rounded-lg transition text-sm font-semibold"
            >
              <Users size={15} />
              <span className="hidden sm:inline">Clientes</span>
            </Link>
            <span className="bg-white/20 text-white text-sm font-semibold px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
              {counts.todos}<span className="hidden sm:inline"> total</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {(['todos', 'pendiente', 'confirmado', 'cancelado'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                filtro === f
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f].label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filtro === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-6">
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay pedidos {filtro !== 'todos' ? `"${ESTADO_CONFIG[filtro as keyof typeof ESTADO_CONFIG]?.label.toLowerCase()}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => {
              const estado = estadoNormalizado(pedido.estado)
              const { label, cls } = ESTADO_CONFIG[estado]
              const ocupado = accionando === pedido.id

              return (
                <div key={pedido.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${
                  ocupado ? 'opacity-60 pointer-events-none' : 'border-gray-100'
                }`}>
                  {/* Header */}
                  <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <User size={17} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 truncate">{pedido.nombre}</p>
                            {pedido.cliente_dni && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                                DNI {pedido.cliente_dni}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {pedido.telefono}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                          {label}
                        </span>
                        <p className="font-bold text-primary text-base leading-tight">{formatPrice(pedido.total)}</p>
                        <p className="text-xs text-gray-400">{formatDate(pedido.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="px-5 py-3 space-y-1.5">
                    {pedido.productos.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{p.nombre} <span className="text-gray-400">×{p.cantidad}</span></span>
                        <span className="text-gray-900 font-semibold">{formatPrice(p.precio * p.cantidad)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer: entrega + acciones */}
                  <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    {/* Entrega */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pedido.tipo_entrega === 'retiro' ? (
                        <>
                          <MapPin size={14} className="text-primary shrink-0" />
                          <span className="text-gray-600">Retiro en tienda</span>
                        </>
                      ) : (
                        <>
                          <Truck size={14} className="text-primary shrink-0" />
                          <span className="text-gray-600 truncate max-w-[200px]">Envío: {pedido.direccion}</span>
                        </>
                      )}
                      {pedido.metodo_pago && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          pedido.metodo_pago === 'credito'
                            ? 'bg-orange-100 text-orange-700'
                            : pedido.metodo_pago === 'debito'
                            ? 'bg-blue-100 text-blue-700'
                            : pedido.metodo_pago === 'transferencia'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {pedido.metodo_pago === 'efectivo' ? 'Efectivo' : pedido.metodo_pago === 'debito' ? 'Débito' : pedido.metodo_pago === 'transferencia' ? 'Transferencia' : 'Crédito'}
                        </span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${pedido.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 transition font-semibold"
                      >
                        WA
                      </a>

                      {/* Confirmar */}
                      {estado !== 'confirmado' && (
                        <button
                          onClick={() => handleConfirmar(pedido.id)}
                          title="Confirmar pedido"
                          className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1.5 rounded-full hover:bg-primary-dark transition font-semibold"
                        >
                          <Check size={12} /> Confirmar
                        </button>
                      )}

                      {/* Cancelar */}
                      {estado !== 'cancelado' && (
                        <button
                          onClick={() => handleCancelar(pedido.id)}
                          title="Cancelar pedido"
                          className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2.5 py-1.5 rounded-full hover:bg-orange-600 transition font-semibold"
                        >
                          <X size={12} /> Cancelar
                        </button>
                      )}

                      {/* Eliminar */}
                      <button
                        onClick={() => handleEliminar(pedido.id)}
                        title="Eliminar pedido"
                        className="text-gray-300 hover:text-red-500 transition p-1.5"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    }>
      <AdminPedidosContent />
    </Suspense>
  )
}
