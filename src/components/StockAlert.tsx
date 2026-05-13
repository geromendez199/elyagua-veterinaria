'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, Loader2, Check } from 'lucide-react'

interface StockAlertProps {
  productId: string
  productName: string
  inStock: boolean
}

export default function StockAlert({ productId, productName, inStock }: StockAlertProps) {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.from('stock_alerts').insert([{
        producto_id: productId,
        email,
        nombre: nombre || 'Cliente',
        activa: true,
      }])

      if (error) throw error

      setMessage('✓ Te notificaremos cuando vuelva a stock')
      setSubscribed(true)
      setEmail('')
      setNombre('')

      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Error al suscribirse. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Solo mostrar si el producto está sin stock
  if (inStock) return null

  return (
    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
      {subscribed ? (
        <div className="flex items-center gap-2 text-blue-700">
          <Check size={20} className="text-blue-600" />
          <div>
            <p className="font-semibold">¡Avisaremos cuando vuelva!</p>
            <p className="text-sm">Te enviaremos un email cuando {productName} esté disponible</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-blue-600" />
            <p className="font-semibold text-blue-900">Notificación de stock</p>
          </div>

          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          />

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm shrink-0"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Notificar'}
            </button>
          </div>

          {message && <p className="text-sm text-blue-700">{message}</p>}
        </form>
      )}
    </div>
  )
}
