'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Oferta } from '@/types'
import { fetchAvailableOffers, getApplicableOffers, calculateOfferSavings } from '@/lib/offer-utils'
import { Sparkles } from 'lucide-react'

export default function ApplicableOffers() {
  const { items, appliedOffer, setAppliedOffer, setAvailableOffers } = useCart()
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)
  const [applicableOffers, setApplicableOffers] = useState<Oferta[]>([])

  useEffect(() => {
    const loadOfertas = async () => {
      try {
        const data = await fetchAvailableOffers()
        setOfertas(data)
        setAvailableOffers(data)
      } catch (error) {
        console.error('Error loading offers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOfertas()
  }, [setAvailableOffers])

  useEffect(() => {
    if (items.length === 0) {
      setApplicableOffers([])
      setAppliedOffer(null)
      return
    }

    // Convert items to the format expected by getApplicableOffers
    const cartItems = items.map((item) => ({
      id: item.product.id,
      nombre: item.product.nombre,
      precio: item.product.precio,
      cantidad: item.quantity,
      puntos: item.product.puntos,
    }))

    const applicable = getApplicableOffers(cartItems, ofertas)
    setApplicableOffers(applicable)

    // Remove applied offer if it's no longer applicable
    if (appliedOffer && !applicable.find((o) => o.id === appliedOffer.id)) {
      setAppliedOffer(null)
    }
  }, [items, ofertas, appliedOffer, setAppliedOffer])

  if (loading || applicableOffers.length === 0) {
    return null
  }

  return (
    <div className="mt-5 p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-red-600" />
        <p className="text-sm font-semibold text-red-900">Ofertas disponibles</p>
      </div>

      <div className="space-y-2">
        {applicableOffers.map((oferta) => {
          const cartItems = items.map((item) => ({
            id: item.product.id,
            nombre: item.product.nombre,
            precio: item.product.precio,
            cantidad: item.quantity,
            puntos: item.product.puntos,
          }))

          const savings = calculateOfferSavings(oferta, cartItems)
          const isApplied = appliedOffer?.id === oferta.id

          return (
            <button
              key={oferta.id}
              onClick={() => setAppliedOffer(isApplied ? null : oferta)}
              className={`w-full text-left px-3 py-2 rounded-lg transition border ${
                isApplied
                  ? 'bg-red-100 border-red-300'
                  : 'bg-white border-red-100 hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{oferta.titulo}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {oferta.tipo === 'porcentaje'
                      ? `${oferta.descuento_porcentaje}% de descuento`
                      : `Combo a $${oferta.precio_especial?.toLocaleString('es-AR')}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    -${savings.amount.toLocaleString('es-AR')}
                  </p>
                  <p className={`text-xs ${isApplied ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {isApplied ? '✓ Aplicada' : 'Aplicar'}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {appliedOffer && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-700 text-center">
            <strong>Oferta activa:</strong> {appliedOffer.titulo}
          </p>
        </div>
      )}
    </div>
  )
}
