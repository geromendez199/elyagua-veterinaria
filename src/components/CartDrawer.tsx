'use client'

import { useState, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { useCoupon } from '@/context/CouponContext'
import { X, Minus, Plus, Check, MapPin, Truck, Loader2, Tag } from 'lucide-react'
import { OrderFormData, DeliveryType } from '@/types'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/formatPrice'
import { WA_URL } from '@/lib/constants'
import { purchaseEvent } from '@/lib/analytics'

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
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')

  const [formData, setFormData] = useState<OrderFormData>({
    nombre: '',
    telefono: '',
    deliveryType: 'retiro',
    dni: '',
    metodoPago: 'efectivo',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    telefono: false,
    direccion: false,
  })

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const currentStep = step === 'cart' ? 0 : 1

  // ── Validación de stock antes de pasar al checkout ─────────────
  const [checkingStock, setCheckingStock] = useState(false)
  const [stockErrors, setStockErrors] = useState<string[]>([])

  const handleContinuar = async () => {
    if (items.length === 0) return
    setCheckingStock(true)
    setStockErrors([])
    try {
      const ids = items.map((i) => i.product.id)
      const { data } = await supabase.from('productos').select('id, nombre, stock').in('id', ids)
      const errors: string[] = []
      for (const item of items) {
        const current = data?.find((p) => p.id === item.product.id)
        const available = current?.stock ?? 0
        if (available < item.quantity) {
          errors.push(
            available === 0
              ? `"${item.product.nombre}" ya no tiene stock`
              : `"${item.product.nombre}": solo quedan ${available} (tenés ${item.quantity} en el carrito)`
          )
        }
      }
      if (errors.length > 0) { setStockErrors(errors); return }
      setStep('checkout')
    } catch {
      setStep('checkout')
    } finally {
      setCheckingStock(false)
    }
  }

  // ── DNI: auto-reconocimiento de cliente ──────────────────────
  const [dniLookup, setDniLookup] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle')

  const handleDniChange = async (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 8)
    setFormData(prev => ({ ...prev, dni: sanitized }))
    if (sanitized.length < 8) { setDniLookup('idle'); return }
    setDniLookup('loading')
    try {
      const { data } = await supabase.from('clientes').select('nombre, telefono').eq('dni', sanitized).limit(1)
      const found = data?.[0]
      if (found) {
        setDniLookup('found')
        setFormData(prev => ({
          ...prev,
          nombre: prev.nombre || found.nombre,
          telefono: prev.telefono || (found.telefono ? found.telefono.replace(/^\+549/, '') : ''),
        }))
      } else {
        setDniLookup('notfound')
      }
    } catch {
      setDniLookup('idle')
    }
  }

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
      const items = (data.direcciones || []).map((d: any) => d.nomenclatura as string).filter(Boolean)
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

  const handleDeliveryChange = (type: DeliveryType) => {
    const pagoActual = formData.metodoPago || 'efectivo'
    const pagoIncompatible = type === 'envio' && ['debito', 'credito'].includes(pagoActual)
    setFormData({
      ...formData,
      deliveryType: type,
      direccion: type === 'retiro' ? '' : formData.direccion,
      metodoPago: pagoIncompatible ? 'efectivo' : pagoActual,
    })
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
    if (field === 'telefono') return value.length >= 10 ? '' : 'Ingresá los 10 dígitos sin 0 ni 15'
    if (field === 'direccion') return value.trim() ? '' : 'Ingresá tu dirección'
    return ''
  }

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const value =
      field === 'direccion' ? formData.direccion || '' : (formData as any)[field]
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  // ── Validación de cupones ──
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const { data } = await supabase
        .from('cupones')
        .select('*')
        .eq('codigo', couponCode.toUpperCase())
        .eq('activo', true)
        .single()

      if (!data) {
        setCouponError('Cupón inválido o inactivo')
        return
      }

      applyCoupon(data.codigo, data.descuento_porcentaje)
      setCouponCode('')
    } catch {
      setCouponError('Cupón no encontrado')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[field as keyof FormTouched]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

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

    const metodoPagoLabel = { efectivo: 'Efectivo', debito: 'Débito (precio lista)', credito: 'Crédito (con recargo)', transferencia: 'Transferencia bancaria' }
    const finalTotal = appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total
    const discountLine = appliedCoupon ? [`🎟️ *Descuento (${appliedCoupon.descuento_porcentaje}%):* -${formatPrice(total - finalTotal)}`] : []
    const message = [
      `🐾 *EL YAGUA VETERINARIA — Nuevo pedido*`,
      ``,
      `👤 *Cliente:* ${formData.nombre}`,
      ...(formData.dni ? [`🪪 *DNI:* ${formData.dni}`] : []),
      `📱 *Teléfono:* +549${formData.telefono}`,
      `📦 *Entrega:* ${deliveryInfo}`,
      `💳 *Pago:* ${metodoPagoLabel[formData.metodoPago || 'efectivo']}`,
      ``,
      `━━━━━━━━━━━━━━━`,
      `🛒 *PRODUCTOS*`,
      `━━━━━━━━━━━━━━━`,
      ``,
      productLines,
      ``,
      `━━━━━━━━━━━━━━━`,
      `Subtotal: ${formatPrice(total)}`,
      ...discountLine,
      `💰 *TOTAL: ${formatPrice(finalTotal)}*`,
      `━━━━━━━━━━━━━━━`,
    ].join('\n')

    const whatsappUrl = `${WA_URL}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    // Registrar pedido y cliente en Supabase en segundo plano
    ;(async () => {
      try {
        const finalTotal = appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total
        const { data } = await supabase.from('pedidos').insert([{
          nombre: formData.nombre,
          telefono: `+549${formData.telefono}`,
          tipo_entrega: formData.deliveryType,
          direccion: formData.direccion || null,
          productos: items.map((i) => ({ id: i.product.id, nombre: i.product.nombre, cantidad: i.quantity, precio: i.product.precio })),
          total: finalTotal,
          cupón_codigo: appliedCoupon?.codigo || null,
          cliente_dni: formData.dni || null,
          metodo_pago: formData.metodoPago || 'efectivo',
        }]).select()

        if (data?.[0]?.id) {
          purchaseEvent(finalTotal, 'ARS', data[0].id)
        }

        if (formData.dni) {
          await supabase.from('clientes').upsert({
            dni: formData.dni,
            nombre: formData.nombre,
            telefono: `+549${formData.telefono}`,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'dni' })
        }
      } catch {}
    })()
    clearCart()
    onClose()
    setStep('cart')
    setFormData({ nombre: '', telefono: '', deliveryType: 'retiro', dni: '', metodoPago: 'efectivo' })
    setErrors({})
    setTouched({ nombre: false, telefono: false, direccion: false })
    setDniLookup('idle')
  }

  if (!isOpen) return null

  // ── Estilos compartidos ───────────────────────────────────────
  const inputCls = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 outline-none text-gray-900 bg-white placeholder-gray-400 transition ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'
    }`

  return (
    <>
      {/* Overlay — z-[55] cubre el botón flotante de WhatsApp (z-50) */}
      <div className="fixed inset-0 bg-black/50 z-[55]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-[60] overflow-y-auto flex flex-col text-gray-900">

        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">
            {step === 'cart' ? 'Mi Carrito' : 'Datos del pedido'}
          </h2>
          <button onClick={onClose} className="hover:bg-primary-dark p-1 rounded" aria-label="Cerrar carrito">
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
                  <div className="flex justify-end mb-1">
                    <button
                      onClick={clearCart}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="border border-gray-200 rounded-xl p-3 flex gap-3">
                        {/* Imagen del producto */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {item.product.imagen_url ? (
                            <img
                              src={item.product.imagen_url}
                              alt={item.product.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <span className="text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.product.nombre}</h4>
                            <p className="font-bold text-primary text-sm shrink-0">{formatPrice(item.product.precio * item.quantity)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">{formatPrice(item.product.precio)} c/u</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2">
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  className="hover:text-primary p-1 text-gray-700"
                                  aria-label={`Disminuir cantidad de ${item.product.nombre}`}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-bold w-5 text-center text-gray-900 text-sm" aria-label={`Cantidad: ${item.quantity}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                  className="hover:text-primary p-1 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label={`Aumentar cantidad de ${item.product.nombre}`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-gray-300 hover:text-red-500 p-1 transition"
                                aria-label={`Eliminar ${item.product.nombre} del carrito`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cupones */}
                  <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={16} className="text-rose-500" />
                      <p className="text-sm font-semibold text-gray-800">Aplicar cupón</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Código de cupón"
                        className="flex-1 px-3 py-2 border border-rose-300 rounded-lg text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 bg-white"
                        disabled={couponLoading || !!appliedCoupon}
                      />
                      <button
                        onClick={validateCoupon}
                        disabled={!couponCode.trim() || couponLoading || !!appliedCoupon}
                        className="px-3 py-2 bg-rose-500 text-white rounded-lg font-semibold text-sm hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                      >
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-800">✓ Cupón aplicado</p>
                          <p className="text-xs text-green-700">{appliedCoupon.codigo} ({appliedCoupon.descuento_porcentaje}% descuento)</p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-green-700 hover:text-green-900 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
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
            <div className="space-y-5 pb-2">

              {/* ── Entrega ── */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">¿Cómo recibís tu pedido?</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'retiro', label: 'Retiro en tienda', sub: 'Bv Lehmann 609 · Gratis', icon: MapPin },
                    { value: 'envio',  label: 'Envío a domicilio', sub: 'Costo a coordinar',       icon: Truck  },
                  ] as const).map(({ value, label, sub, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-2 py-4 px-2 border-2 rounded-2xl cursor-pointer transition text-center ${
                        formData.deliveryType === value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input type="radio" className="sr-only" checked={formData.deliveryType === value} onChange={() => handleDeliveryChange(value)} />
                      <Icon size={22} className={formData.deliveryType === value ? 'text-primary' : 'text-gray-300'} />
                      <div>
                        <p className={`font-bold text-sm leading-tight ${formData.deliveryType === value ? 'text-primary' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Dirección (solo si envío) ── */}
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
                      onBlur={() => { handleBlur('direccion'); setTimeout(() => setShowAddressSuggestions(false), 150) }}
                      onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                      className={`${inputCls(!!errors.direccion && touched.direccion)} pr-8`}
                      placeholder="Calle y número..."
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

              {/* ── Nombre ── */}
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
                  placeholder="Tu nombre y apellido"
                />
                {errors.nombre && touched.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* ── Teléfono ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${
                  errors.telefono && touched.telefono
                    ? 'border-red-400 focus-within:ring-red-200'
                    : 'border-gray-300 focus-within:ring-primary/20 focus-within:border-primary'
                }`}>
                  <span className="px-3 py-2 bg-gray-100 text-gray-500 font-medium border-r border-gray-300 shrink-0 select-none text-sm">+549</span>
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
                  <p className="text-gray-400 text-xs mt-1">10 dígitos, sin el 0 ni el 15</p>
                )}
              </div>

              {/* ── Método de pago ── */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {formData.deliveryType === 'retiro' ? '¿Cómo pagás en tienda?' : '¿Cómo pagás el envío?'}
                </p>
                <div className="space-y-2">
                  {(formData.deliveryType === 'retiro'
                    ? [
                        { value: 'efectivo',      label: 'Efectivo',              desc: 'Precio de lista' },
                        { value: 'debito',         label: 'Débito',                desc: 'Precio de lista' },
                        { value: 'credito',        label: 'Crédito',               desc: 'Con recargo' },
                      ]
                    : [
                        { value: 'efectivo',      label: 'Efectivo',              desc: 'Pagás al recibir el pedido' },
                        { value: 'transferencia', label: 'Transferencia bancaria', desc: 'Te enviamos el CBU/alias por WhatsApp' },
                      ]
                  ).map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition ${
                        formData.metodoPago === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={formData.metodoPago === opt.value}
                        onChange={() => setFormData(prev => ({ ...prev, metodoPago: opt.value as typeof formData.metodoPago }))}
                        className="w-4 h-4 accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                      {formData.metodoPago === opt.value && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* ── DNI (opcional) ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  DNI <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.dni || ''}
                    onChange={(e) => handleDniChange(e.target.value)}
                    className={`${inputCls(false)} pr-9 ${dniLookup === 'found' ? 'border-green-400 focus:border-green-500' : ''}`}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  {dniLookup === 'loading' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={15} className="text-gray-400 animate-spin" />
                    </div>
                  )}
                  {dniLookup === 'found' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check size={15} className="text-green-500" />
                    </div>
                  )}
                </div>
                {dniLookup === 'found' ? (
                  <p className="text-green-600 text-xs mt-1 font-semibold">¡Te reconocemos! Datos cargados automáticamente.</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">Para que tus próximos pedidos sean más rápidos</p>
                )}
              </div>

              {/* ── Resumen ── */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tu pedido</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.product.nombre} ×{item.quantity}</span>
                    <span className="text-gray-900 font-semibold shrink-0">{formatPrice(item.product.precio * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
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
              {appliedCoupon && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Descuento ({appliedCoupon.descuento_porcentaje}%):</span>
                    <span>-{formatPrice(total * (appliedCoupon.descuento_porcentaje / 100))}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-primary">
                  {appliedCoupon
                    ? formatPrice(total * (1 - appliedCoupon.descuento_porcentaje / 100))
                    : formatPrice(total)
                  }
                </span>
              </div>
              {stockErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                  {stockErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
              <button
                onClick={handleContinuar}
                disabled={checkingStock}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {checkingStock ? (
                  <><Loader2 size={18} className="animate-spin" /> Verificando stock...</>
                ) : 'Continuar →'}
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