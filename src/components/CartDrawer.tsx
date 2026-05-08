'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { X, Minus, Plus } from 'lucide-react'
import { OrderFormData, DeliveryType } from '@/types'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [formData, setFormData] = useState<OrderFormData>({
    nombre: '',
    telefono: '',
    deliveryType: 'retiro',
  })

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQty)
    }
  }

  const handleCheckout = () => {
    if (!formData.nombre || !formData.telefono) {
      alert('Por favor completa nombre y teléfono')
      return
    }
    if (formData.deliveryType === 'envio' && !formData.direccion) {
      alert('Por favor completa la dirección')
      return
    }
    sendWhatsApp()
  }

  const formatPrice = (n: number) =>
    '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const sendWhatsApp = () => {
    const deliveryInfo =
      formData.deliveryType === 'retiro'
        ? '🏪 Retiro en tienda'
        : `🚚 Envío a domicilio: ${formData.direccion}`

    const productLines = items
      .map((item) =>
        `▸ ${item.product.nombre}\n   ${item.quantity} unidad${item.quantity > 1 ? 'es' : ''} × ${formatPrice(item.product.precio)} = *${formatPrice(item.product.precio * item.quantity)}*`
      )
      .join('\n\n')

    const message = [
      `🐾 *EL YAGUA VETERINARIA — Nuevo pedido*`,
      ``,
      `👤 *Cliente:* ${formData.nombre}`,
      `📱 *Teléfono:* ${formData.telefono}`,
      `📦 *Entrega:* ${deliveryInfo}`,
      ``,
      `━━━━━━━━━━━━━━━`,
      `🛒 *PRODUCTOS*`,
      `━━━━━━━━━━━━━━━`,
      ``,
      productLines,
      ``,
      `━━━━━━━━━━━━━━━`,
      `💰 *TOTAL: ${formatPrice(total)}*`,
      `━━━━━━━━━━━━━━━`,
    ].join('\n')

    const whatsappUrl = `https://wa.me/5493492730010?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    clearCart()
    onClose()
    setStep('cart')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer — forzamos colores light independientemente del modo del sistema */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto flex flex-col text-gray-900">

        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">
            {step === 'cart' ? 'Mi Carrito' : 'Confirmar Compra'}
          </h2>
          <button onClick={onClose} className="hover:bg-primary-dark p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {step === 'cart' ? (
            <>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="border border-gray-200 rounded-lg p-3 flex gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.product.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ${item.product.precio.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="hover:text-primary p-1 text-gray-700"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold w-6 text-center text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="hover:text-primary p-1 text-gray-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono/WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-gray-900 bg-white placeholder-gray-400"
                  placeholder="+54 9 3492 000000"
                />
              </div>

              {/* Tipo de entrega */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de entrega
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={formData.deliveryType === 'retiro'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'retiro' })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="font-medium text-gray-800">Retiro en tienda</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={formData.deliveryType === 'envio'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'envio' })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="font-medium text-gray-800">Envío a domicilio</span>
                  </label>
                </div>
              </div>

              {/* Dirección (solo si envío) */}
              {formData.deliveryType === 'envio' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Dirección de entrega
                  </label>
                  <textarea
                    value={formData.direccion || ''}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Tu dirección completa"
                    rows={3}
                  />
                </div>
              )}

              {/* Resumen */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-gray-900 mb-3">Resumen del pedido</h4>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product.nombre} x{item.quantity}</span>
                    <span className="text-gray-900 font-medium">${(item.product.precio * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Total:</span>
                  <span className="text-primary font-bold text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2 shrink-0">
          {step === 'cart' && items.length > 0 && (
            <>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition"
              >
                Ir a checkout →
              </button>
            </>
          )}

          {step === 'checkout' && (
            <>
              <button
                onClick={() => setStep('cart')}
                className="w-full border-2 border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary hover:text-white transition"
              >
                ← Volver
              </button>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition"
              >
                ✓ Confirmar por WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
