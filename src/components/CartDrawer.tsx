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

  const sendWhatsApp = () => {
    const productList = items
      .map((item) => `• ${item.product.nombre} x${item.quantity} — $${(item.product.precio * item.quantity).toFixed(2)}`)
      .join('\n')

    const deliveryInfo =
      formData.deliveryType === 'retiro'
        ? 'Retiro en tienda'
        : `Envío a: ${formData.direccion}`

    const message = `🐾 *Nuevo pedido - El Yagua Veterinaria*

👤 Cliente: ${formData.nombre}
📞 Teléfono: ${formData.telefono}
📦 Entrega: ${deliveryInfo}

🛒 *Productos:*
${productList}

💰 *Total: $${total.toFixed(2)}*`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/5493492730010?text=${encodedMessage}`

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
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-4 flex justify-between items-center">
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
                    <div key={item.product.id} className="border rounded-lg p-3 flex gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.product.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ${item.product.precio.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="hover:text-primary p-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="hover:text-primary p-1"
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
            <>
              {/* Checkout Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                    placeholder="+54 9 1234 567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de entrega
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        checked={formData.deliveryType === 'retiro'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            deliveryType: 'retiro',
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Retiro en tienda</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        checked={formData.deliveryType === 'envio'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            deliveryType: 'envio',
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Envío a domicilio</span>
                    </label>
                  </div>
                </div>

                {formData.deliveryType === 'envio' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Dirección de entrega
                    </label>
                    <textarea
                      value={formData.direccion || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:border-primary"
                      placeholder="Tu dirección completa"
                      rows={3}
                    />
                  </div>
                )}

                {/* Resumen */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-800">Resumen del pedido:</h4>
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>{item.product.nombre} x{item.quantity}</span>
                      <span>${(item.product.precio * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span className="text-primary text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 border-t space-y-2">
          {step === 'cart' && items.length > 0 && (
            <>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Ir a checkout
              </button>
            </>
          )}

          {step === 'checkout' && (
            <>
              <button
                onClick={() => setStep('cart')}
                className="w-full border-2 border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary hover:text-white transition"
              >
                Volver
              </button>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
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
