import { Star } from 'lucide-react'
import { Product, Cliente } from '@/types'

interface CartItem {
  product: Product
  quantity: number
}

interface PuntosInfoProps {
  items: CartItem[]
  clienteActual?: Cliente
}

export default function PuntosInfo({ items, clienteActual }: PuntosInfoProps) {
  // Calcular puntos totales de la compra
  const puntosCompra = items.reduce(
    (total, item) => total + ((item.product.puntos || 0) * item.quantity),
    0
  )

  const puntosActuales = clienteActual?.puntos_acumulados || 0
  const puntosPostCompra = puntosActuales + puntosCompra

  // Si no hay puntos, no mostrar nada
  if (!puntosCompra && !puntosActuales) return null

  return (
    <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Star size={18} className="text-amber-500 fill-amber-500" />
        <h3 className="font-bold text-amber-900">Programa YaguaMillas</h3>
      </div>

      {puntosCompra > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Acumularás {puntosCompra} YaguaMillas</span> con esta compra
          </p>

          {items.some((item) => item.product.puntos) && (
            <div className="text-xs text-amber-700 space-y-1 pl-2 border-l-2 border-amber-300">
              {items
                .filter((item) => item.product.puntos)
                .map((item) => (
                  <div key={item.product.id}>
                    {item.product.nombre} × {item.quantity} = {item.product.puntos! * item.quantity} millas
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {clienteActual && (
        <div className="pt-3 border-t border-amber-200 space-y-2">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">YaguaMillas actuales:</span> {puntosActuales}
          </p>
          {puntosCompra > 0 && (
            <p className="text-sm font-semibold text-amber-900 bg-white px-2 py-1 rounded">
              📍 Después de pagar: <span className="text-amber-600">{puntosPostCompra} YaguaMillas</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
