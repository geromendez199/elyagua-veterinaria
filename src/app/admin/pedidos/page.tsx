import { Suspense } from 'react'
import AdminPedidosContent from './AdminPedidosContent'

export const dynamic = 'force-dynamic'

export default function AdminPedidosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando pedidos...</p>
      </div>
    }>
      <AdminPedidosContent />
    </Suspense>
  )
}
