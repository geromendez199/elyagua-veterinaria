'use client'

import { Oferta } from '@/types'

interface OfertasTableProps {
  ofertas: Oferta[]
  onEdit: (oferta: Oferta) => void
  onDelete: (ofertaId: string) => void
  onToggleActivo: (oferta: Oferta) => void
}

export default function OfertasTable({
  ofertas,
  onEdit,
  onDelete,
  onToggleActivo,
}: OfertasTableProps) {
  const getStatus = (oferta: Oferta) => {
    const now = new Date()
    const inicio = new Date(oferta.fecha_inicio)
    const fin = new Date(oferta.fecha_fin)

    if (now < inicio) return { label: 'Próxima', color: 'bg-blue-100 text-blue-800' }
    if (now > fin) return { label: 'Expirada', color: 'bg-gray-100 text-gray-800' }
    return { label: 'Activa', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 font-semibold text-gray-900">Título</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Tipo</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Valor</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Productos</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Usos</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Estado</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Válida hasta</th>
            <th className="px-6 py-3 font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ofertas.map((oferta) => {
            const status = getStatus(oferta)
            return (
              <tr key={oferta.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{oferta.titulo}</div>
                  {oferta.descripcion && (
                    <div className="text-xs text-gray-500">{oferta.descripcion}</div>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {oferta.tipo === 'porcentaje' ? '% Descuento' : 'Combo'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {oferta.tipo === 'porcentaje'
                    ? `${oferta.descuento_porcentaje}%`
                    : `$${oferta.precio_especial?.toLocaleString('es-AR')}`}
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm">
                    {oferta.productos?.length || 0} productos
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm">
                    {oferta.usos_actuales}
                    {oferta.cantidad_maxima_usos ? `/${oferta.cantidad_maxima_usos}` : ''}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {oferta.activo ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Habilitada
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Deshabilitada
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-sm">
                  {new Date(oferta.fecha_fin).toLocaleDateString('es-AR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(oferta)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onToggleActivo(oferta)}
                      className={`font-medium ${
                        oferta.activo
                          ? 'text-orange-600 hover:text-orange-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {oferta.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => onDelete(oferta.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
