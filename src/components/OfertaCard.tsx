'use client'

import Image from 'next/image'
import { Oferta } from '@/types'

interface OfertaCardProps {
  oferta: Oferta
}

export default function OfertaCard({ oferta }: OfertaCardProps) {
  const productos = oferta.productos || []

  // Calculate original price total for percentage offers
  const calculateOriginalPrice = () => {
    if (oferta.tipo === 'porcentaje') {
      return productos.reduce((sum, p) => {
        const product = p.productos
        return sum + (product?.precio || 0)
      }, 0)
    }
    return null
  }

  // Calculate savings
  const calculateSavings = () => {
    if (oferta.tipo === 'porcentaje') {
      const originalPrice = calculateOriginalPrice() || 0
      const savings = (originalPrice * oferta.descuento_porcentaje!) / 100
      return { amount: savings, percentage: oferta.descuento_porcentaje }
    }
    if (oferta.tipo === 'combo') {
      const originalPrice = calculateOriginalPrice() || 0
      const savings = originalPrice - (oferta.precio_especial || 0)
      const percentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0
      return { amount: savings, percentage }
    }
    return null
  }

  const savings = calculateSavings()
  const originalPrice = calculateOriginalPrice()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
      {/* Oferta Badge */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3">
        <div className="text-sm font-semibold uppercase tracking-wide">
          {oferta.tipo === 'porcentaje' ? '% DESCUENTO' : 'COMBO ESPECIAL'}
        </div>
        <h3 className="text-xl font-bold mt-1">{oferta.titulo}</h3>
        {oferta.descripcion && (
          <p className="text-sm mt-1 text-red-100">{oferta.descripcion}</p>
        )}
      </div>

      {/* Productos */}
      <div className="p-4">
        <div className="space-y-3">
          {productos.map((p) => {
            const product = p.productos
            return (
              <div key={p.producto_id} className="flex gap-3">
                {product?.imagen_url && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={product.imagen_url}
                      alt={product?.nombre || 'Producto'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{product?.nombre}</p>
                  {p.cantidad && oferta.tipo === 'combo' && (
                    <p className="text-sm text-gray-600">Cantidad: {p.cantidad}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    ${product?.precio.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {oferta.tipo === 'porcentaje' && originalPrice !== null && savings ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio original:</span>
                <span className="text-gray-800 line-through">
                  ${originalPrice.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-red-600">
                  {savings.percentage}% Descuento
                </span>
                <span className="font-bold text-lg text-green-600">
                  -${savings.amount.toLocaleString('es-AR')}
                </span>
              </div>
            </>
          ) : null}

          {oferta.tipo === 'combo' && oferta.precio_especial !== null && savings ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio original:</span>
                <span className="text-gray-800 line-through">
                  ${originalPrice?.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio combo:</span>
                <span className="text-green-600 font-bold text-lg">
                  ${oferta.precio_especial.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="text-center text-sm text-orange-600 font-semibold">
                ¡Ahorras ${savings.amount.toLocaleString('es-AR')}! ({savings.percentage}%)
              </div>
            </>
          ) : null}
        </div>

        {/* Dates */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Válida hasta{' '}
          {new Date(oferta.fecha_fin).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  )
}
