'use client'

import { useState, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { X, Minus, Plus, Check, MapPin, Truck, Loader2 } from 'lucide-react'
import { OrderFormData, DeliveryType } from '@/types'
import { supabase } from '@/lib/supabase'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type FormErrors = {
  nombre?: string
  telefono?: string
  direccion?: string
}

type FormTouched = {
  nombre: boolean
  telefono: boolean
  direccion: boolean
}

// ── Pasos del checkout ─────────────────────────────────────────
const STEPS = ['Carrito', 'Datos del pedido']

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')

  const [formData, setFormData] = useState<OrderFormData>({
    nombre: '',
    telefono: '',
    deliveryType: 'retiro',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    telefono: false,
    direccion: false,
  })

  const currentStep = step === 'cart' ? 0 : 1

  // ── Autocomplete de dirección (Georef Argentina) ───────────────
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [fetchingAddress, setFetchingAddress] = useState(false)
  const addressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAddressSuggestions = async (query: string) => {
    if (query.trim().length < 3) { setAddressSuggestions([]); return }
    setFetchingAddress(true)
    try {
      const res = await fetch(
        `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(query)}&provincia=santa+fe&max=6`
      )
      const data = await res.json()
      const items = (data.direcciones || []).map((d: any) => d.nomenclatura as string)
      setAddressSuggestions(items)
    } catch {
      setAddressSuggestions([])
    } finally {
      setFetchingAddress(false)
    }
  }

  const handleAddressChange = (value: string) => {
    handleChange('direccion', value)
    setShowAddressSuggestions(true)
    if (addressTimerRef.current) clearTimeout(addressTimerRef.current)
    addressTimerRef.current = setTimeout(() => fetchAddressSuggestions(value), 350)
  }

  const handleAddressSelect = (suggestion: string) => {
    handleChange('direccion', suggestion)
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
  }

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQty)
    }
  }

  // ── Validación ────────────────────────────────────────────────
  const validateField = (field: string, value: string): string => {
    if (field === 'nombre') return value.trim() ? '' : 'El nombre es requerido'
    if (field === 'telefono') return value.length >= 8 ? '' : 'Mínimo 8 dígitos'
    if (field === 'direccion') return value.trim() ? '' : 'Ingresá tu dirección'
    return ''
  }

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const value =
      field === 'direccion' ? formData.direccion || '' : (formData as any)[field]
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[field as keyof FormTouched]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  // ── Formato de precio ─────────────────────────────────────────
  const formatPrice = (n: number) =>
    '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  // ── Checkout ──────────────────────────────────────────────────
  const handleCheckout = () => {
    // Marcar todos como tocados y validar
    const newErrors: FormErrors = {
      nombre: validateField('nombre', formData.nombre),
      telefono: validateField('telefono', formData.telefono),
      direccion:
        formData.deliveryType === 'envio'
          ? validateField('direccion', formData.direccion || '')
          : '',
    }
    setErrors(newErrors)
    setTouched({ nombre: true, telefono: true, direccion: true })

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) return

    sendWhatsApp()
  }

  const sendWhatsApp = async () => {
    const deliveryInfo =
      formData.deliveryType === 'retiro'
        ? '🏪 Retiro en tienda'
        : `🚚 Envío a domicilio: ${formData.direccion}`

    const productLines = items
      .map(
        (item) =>
          `▸ ${item.product.nombre}\n   ${item.quantity} unidad${item.quantity > 1 ? 'es' : ''} × ${formatPrice(item.product.precio)} = *${formatPrice(item.product.precio * item.quantity)}*`
      )
      .join('\n\n')

    const message = [
      `🐾 *EL YAGUA VETERINARIA — Nuevo pedido*`,
      ``,
      `👤 *Cliente:* ${formData.nombre}`,
      `📱 *Teléfono:* +549${formData.telefono}`,
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

    // Registrar pedido en Supabase en segundo plano (no bloquea el popup de WhatsApp)
    supabase.from('pedidos').insert([{
      nombre: formData.nombre,
      telefono: `+549${formData.telefono}`,
      tipo_entrega: formData.deliveryType,
      direccion: formData.direccion || null,
      productos: items.map((i) => ({ nombre: i.product.nombre, cantidad: i.quantity, precio: i.product.precio })),
      total,
    }]).catch(() => {})
    clearCart()
    onClose()
    setStep('cart')
    setFormData({ nombre: '', telefono: '', deliveryType: 'retiro' })
    setErrors({})
    setTouched({ nombre: false, telefono: false, direccion: false })
  }

  if (!isOpen) return null

  // ── Estilos compartidos ───────────────────────────────────────
  const inputCls = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 outline-none text-gray-900 bg-white placeholder-gray-400 transition ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'
    }`

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto flex flex-col text-gray-900">

        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">
            {step === 'cart' ? 'Mi Carrito' : 'Datos del pedido'}
          </h2>
          <button onClick={onClose} className="hover:bg-primary-dark p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center px-5 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    i < currentStep
                      ? 'bg-primary text-white'
                      : i === currentStep
                      ? 'bg-primary text-white ring-2 ring-primary/30'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < currentStep ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    i <= currentStep ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition ${
                    i < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">

          {/* ── STEP 1: Carrito ── */}
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-1">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm">Agregá productos para comenzar</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="border border-gray-200 rounded-xl p-3 flex gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.product.nombre}</h4>
                          <p className="text-primary font-bold text-sm mt-0.5">
                            {formatPrice(item.product.precio)} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="hover:text-primary p-1 text-gray-700"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold w-5 text-center text-gray-900 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="hover:text-primary p-1 text-gray-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-300 hover:text-red-500 p-1 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Info de envío */}
                  <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Opciones de entrega</p>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Retiro gratuito en tienda</p>
                        <p className="text-xs text-gray-500 mt-0.5">Bv Lehmann 609, Rafaela · Lun–Vie 7:30–21hs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Truck size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Envío a domicilio</p>
                        <p className="text-xs text-gray-500 mt-0.5">Consultá disponibilidad al confirmar el pedido</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── STEP 2: Formulario ── */}
          {step === 'checkout' && (
            <div className="space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={inputCls(!!errors.nombre && touched.nombre)}
                  placeholder="Tu nombre"
                />
                {errors.nombre && touched.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono/WhatsApp <span className="text-red-500">*</span>
                </label>
                <div
                  className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${
                    errors.telefono && touched.telefono
                      ? 'border-red-400 focus-within:ring-red-200'
                      : 'border-gray-300 focus-within:ring-primary/20 focus-within:border-primary'
                  }`}
                >
                  <span className="px-3 py-2 bg-gray-100 text-gray-500 font-medium border-r border-gray-300 shrink-0 select-none text-sm">
                    +549
                  </span>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('telefono')}
                    className="flex-1 px-3 py-2 outline-none text-gray-900 bg-white placeholder-gray-400 text-sm"
                    placeholder="3492XXXXXX"
                    maxLength={12}
                  />
                </div>
                {errors.telefono && touched.telefono ? (
                  <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">Solo el número, sin el 0 ni el 15</p>
                )}
              </div>

              {/* Tipo de entrega */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de entrega
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                      formData.deliveryType === 'retiro'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={formData.deliveryType === 'retiro'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'retiro' })}
                      className="w-4 h-4 accent-primary"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Retiro en tienda</p>
                      <p className="text-xs text-gray-500">Bv Lehmann 609 · Gratis</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                      formData.deliveryType === 'envio'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={formData.deliveryType === 'envio'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'envio', direccion: '' })}
                      className="w-4 h-4 accent-primary"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Envío a domicilio</p>
                      <p className="text-xs text-gray-500">Costo a coordinar por WhatsApp</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dirección (solo si envío) */}
              {formData.deliveryType === 'envio' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Dirección de entrega <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.direccion || ''}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      onBlur={() => {
                        handleBlur('direccion')
                        setTimeout(() => setShowAddressSuggestions(false), 150)
                      }}
                      onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                      className={`${inputCls(!!errors.direccion && touched.direccion)} pr-8`}
                      placeholder="Escribí tu calle y número..."
                      autoComplete="off"
                    />
                    {fetchingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={15} className="text-gray-400 animate-spin" />
                      </div>
                    )}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        {addressSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onMouseDown={(e) => { e.preventDefault(); handleAddressSelect(s) }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 transition flex items-start gap-2 border-b border-gray-50 last:border-0"
                          >
                            <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.direccion && touched.direccion && (
                    <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>
                  )}
                </div>
              )}

              {/* Resumen del pedido */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Resumen del pedido</h4>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.product.nombre} ×{item.quantity}</span>
                    <span className="text-gray-900 font-semibold shrink-0">
                      {formatPrice(item.product.precio * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="text-primary font-bold text-xl">{formatPrice(total)}</span>
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
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition"
              >
                Continuar →
              </button>
            </>
          )}

          {step === 'checkout' && (
            <>
              <button
                onClick={() => setStep('cart')}
                className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-2 rounded-xl hover:bg-gray-50 transition"
              >
                ← Volver al carrito
              </button>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 0 0 .614.612l6.288-1.634A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.373l-.36-.214-3.733.97.999-3.62-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Confirmar por WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
