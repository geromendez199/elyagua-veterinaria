'use client'

import { useRef } from 'react'
import NextImage from 'next/image'
import { useCart } from '@/context/CartContext'
import { useCoupon } from '@/context/CouponContext'
import { X, Minus, Plus, Check, MapPin, Truck, Loader2, Tag } from 'lucide-react'
import { DeliveryType } from '@/types'
import { supabase } from '@/lib/supabase'
import { checkProductStock, fetchLoyaltyProgram } from '@/lib/supabase-queries'
import { formatPrice } from '@/lib/formatPrice'
import { WA_URL } from '@/lib/constants'
import { purchaseEvent } from '@/lib/analytics'
import PuntosInfo from './PuntosInfo'
import { useCartDrawerReducer } from '@/hooks/useCartDrawerReducer'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const STEPS = ['Carrito', 'Datos del pedido']

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon()

  // Single reducer for all state management
  const { state, dispatch } = useCartDrawerReducer()
  const currentStep = state.step === 'cart' ? 0 : 1

  const handleContinuar = async () => {
    if (items.length === 0) return
    dispatch({ type: 'SET_CHECKING_STOCK', payload: true })
    dispatch({ type: 'SET_STOCK_ERRORS', payload: [] })
    try {
      const ids = items.map((i) => i.product.id)
      const { data, error } = await checkProductStock(ids)

      if (error) {
        dispatch({ type: 'SET_STEP', payload: 'checkout' })
        return
      }

      const errors: string[] = []
      for (const item of items) {
        const current = data.find((p) => p.id === item.product.id)
        const available = current?.stock ?? 0
        if (available < item.quantity) {
          errors.push(
            available === 0
              ? `"${item.product.nombre}" ya no tiene stock`
              : `"${item.product.nombre}": solo quedan ${available} (tenés ${item.quantity} en el carrito)`
          )
        }
      }

      if (errors.length > 0) {
        dispatch({ type: 'SET_STOCK_ERRORS', payload: errors })
        return
      }
      dispatch({ type: 'SET_STEP', payload: 'checkout' })
    } catch {
      dispatch({ type: 'SET_STEP', payload: 'checkout' })
    } finally {
      dispatch({ type: 'SET_CHECKING_STOCK', payload: false })
    }
  }

  const handleDniChange = async (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 8)
    dispatch({ type: 'UPDATE_FORM', payload: { dni: sanitized } })

    if (sanitized.length < 8) {
      dispatch({ type: 'CLEAR_DNI' })
      removeCoupon()
      return
    }

    dispatch({ type: 'SET_DNI_STATE', payload: 'loading' })
    dispatch({ type: 'SET_LOADING_CUPONES', payload: true })

    try {
      // Optimized: fetch cliente with specific fields
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id, dni, nombre, telefono, notas, puntos_acumulados, created_at, updated_at')
        .eq('dni', sanitized)
        .single()

      if (clienteData) {
        // Fetch loyalty program data with optimized queries
        const { cupones: cuponesData, milestones: milestonesData } = await fetchLoyaltyProgram()

        dispatch({
          type: 'SET_CLIENT',
          payload: {
            client: clienteData,
            cupones: cuponesData,
            milestones: milestonesData,
          },
        })

        // Auto-fill nombre and telefono
        dispatch({
          type: 'UPDATE_FORM',
          payload: {
            nombre: state.formData.nombre || clienteData.nombre,
            telefono: state.formData.telefono || (clienteData.telefono?.replace(/^\+549/, '') || ''),
          },
        })
      } else {
        dispatch({ type: 'SET_DNI_STATE', payload: 'notfound' })
        dispatch({ type: 'SET_LOADING_CUPONES', payload: false })
        removeCoupon()
      }
    } catch {
      dispatch({ type: 'SET_DNI_STATE', payload: 'idle' })
      dispatch({ type: 'SET_LOADING_CUPONES', payload: false })
      removeCoupon()
    }
  }

  const addressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAddressSuggestions = async (query: string) => {
    if (query.trim().length < 3) {
      dispatch({ type: 'SET_ADDRESS_SUGGESTIONS', payload: [] })
      return
    }

    dispatch({ type: 'SET_LOADING_ADDRESS', payload: true })

    try {
      const res = await fetch(
        `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(query)}&provincia=santa+fe&max=6`
      )
      const data = await res.json()
      const items = (data.direcciones || [])
        .map((d: { nomenclatura?: string }) => d.nomenclatura as string)
        .filter(Boolean)
      dispatch({ type: 'SET_ADDRESS_SUGGESTIONS', payload: items })
    } catch {
      dispatch({ type: 'SET_ADDRESS_SUGGESTIONS', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING_ADDRESS', payload: false })
    }
  }

  const handleAddressChange = (value: string) => {
    handleChange('direccion', value)
    dispatch({ type: 'SET_SHOW_ADDRESS_SUGGESTIONS', payload: true })
    if (addressTimerRef.current) clearTimeout(addressTimerRef.current)
    addressTimerRef.current = setTimeout(() => fetchAddressSuggestions(value), 350)
  }

  const handleAddressSelect = (suggestion: string) => {
    handleChange('direccion', suggestion)
    dispatch({ type: 'SET_SHOW_ADDRESS_SUGGESTIONS', payload: false })
    dispatch({ type: 'SET_ADDRESS_SUGGESTIONS', payload: [] })
  }

  const handleDeliveryChange = (type: DeliveryType) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: {
        deliveryType: type,
        direccion: type === 'retiro' ? '' : state.formData.direccion,
      },
    })
  }

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQty)
    }
  }

  const validateField = (field: string, value: string): string => {
    if (field === 'nombre') return value.trim() ? '' : 'El nombre es requerido'
    if (field === 'telefono') return value.length >= 10 ? '' : 'Ingresá los 10 dígitos sin 0 ni 15'
    if (field === 'direccion') return value.trim() ? '' : 'Ingresá tu dirección'
    return ''
  }

  const handleBlur = (field: keyof typeof state.formTouched) => {
    dispatch({ type: 'SET_TOUCHED', payload: { [field]: true } })
    const value =
      field === 'direccion' ? state.formData.direccion || '' : (state.formData as unknown as Record<string, string>)[field]
    dispatch({ type: 'SET_FORM_ERRORS', payload: { ...state.formErrors, [field]: validateField(field, value) } })
  }

  const handleChange = (field: keyof typeof state.formData, value: string) => {
    dispatch({ type: 'UPDATE_FORM', payload: { [field]: value } })
    // Validar en tiempo real si el campo ya fue tocado
    if (['nombre', 'telefono', 'direccion'].includes(field) && state.formTouched[field as keyof typeof state.formTouched]) {
      dispatch({
        type: 'SET_FORM_ERRORS',
        payload: { ...state.formErrors, [field]: validateField(field, value) },
      })
    }
  }

  const handleCheckout = () => {
    const newErrors: typeof state.formErrors = {
      nombre: validateField('nombre', state.formData.nombre),
      telefono: validateField('telefono', state.formData.telefono),
    }
    if (state.formData.deliveryType === 'envio') {
      newErrors.direccion = validateField('direccion', state.formData.direccion || '')
    }
    dispatch({ type: 'SET_FORM_ERRORS', payload: newErrors })
    dispatch({ type: 'SET_TOUCHED', payload: { nombre: true, telefono: true, direccion: true } })

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (!hasErrors) sendWhatsApp()
  }

  const sendWhatsApp = async () => {
    const deliveryInfo =
      state.formData.deliveryType === 'retiro'
        ? '🏪 Retiro en tienda'
        : `🚚 Envío a domicilio: ${state.formData.direccion}`

    const productLines = items
      .map(
        (item) =>
          `▸ ${item.product.nombre}\n   ${item.quantity} unidad${item.quantity > 1 ? 'es' : ''} × ${formatPrice(item.product.precio)} = *${formatPrice(item.product.precio * item.quantity)}*`
      )
      .join('\n\n')

    const metodoPagoLabel = { efectivo: 'Efectivo', debito: 'Débito / Transferencia', credito: 'Crédito (hasta 3 pagos, con recargo)', transferencia: 'Transferencia bancaria' }
    const efectivoDiscount = state.formData.metodoPago === 'efectivo' ? 0.9 : 1
    const baseTotal = appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total
    const finalTotal = baseTotal * efectivoDiscount
    const discountLine = [
      ...(appliedCoupon ? [`🎟️ *Descuento (${appliedCoupon.descuento_porcentaje}%):* -${formatPrice(total * appliedCoupon.descuento_porcentaje / 100)}`] : []),
      ...(state.formData.metodoPago === 'efectivo' ? [`💵 *Descuento efectivo (10%):* -${formatPrice(baseTotal * 0.1)}`] : []),
    ]
    const totalYaguaMillas = items.reduce((total, item) => total + ((item.product.puntos || 0) * item.quantity), 0)
    const yaguamillasLine = totalYaguaMillas > 0 ? [`⭐ *YaguaMillas:* ${totalYaguaMillas}`] : []
    const message = [
      `🐾 *EL YAGUA VETERINARIA — Nuevo pedido*`,
      ``,
      `👤 *Cliente:* ${state.formData.nombre}`,
      ...(state.formData.dni ? [`🪪 *DNI:* ${state.formData.dni}`] : []),
      `📱 *Teléfono:* +549${state.formData.telefono}`,
      `📦 *Entrega:* ${deliveryInfo}`,
      `💳 *Pago:* ${metodoPagoLabel[state.formData.metodoPago || 'efectivo']}`,
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
      ...yaguamillasLine,
      `━━━━━━━━━━━━━━━`,
    ].join('\n')

    const whatsappUrl = `${WA_URL}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    // Mostrar confirmación de YaguaMillas
    if (totalYaguaMillas > 0 && state.formData.dni) {
      dispatch({
        type: 'SHOW_YAGUAMILLAS_CONFIRM',
        payload: {
          cantidad: totalYaguaMillas,
          nombre: state.formData.nombre,
          dni: state.formData.dni,
        },
      })
    }

    // Registrar pedido y cliente en Supabase en segundo plano
    ;(async () => {
      try {
        const finalTotal = (appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total) * (state.formData.metodoPago === 'efectivo' ? 0.9 : 1)
        const { data } = await supabase.from('pedidos').insert([{
          nombre: state.formData.nombre,
          telefono: `+549${state.formData.telefono}`,
          tipo_entrega: state.formData.deliveryType,
          direccion: state.formData.direccion || null,
          productos: items.map((i) => ({ id: i.product.id, nombre: i.product.nombre, cantidad: i.quantity, precio: i.product.precio })),
          total: finalTotal,
          cupón_id: appliedCoupon?.id || null,
          cliente_dni: state.formData.dni || null,
          metodo_pago: state.formData.metodoPago || 'efectivo',
        }]).select()

        if (data?.[0]?.id) {
          purchaseEvent(finalTotal, 'ARS', data[0].id)

          // Registrar puntos si hay DNI
          if (state.formData.dni) {
            try {
              await fetch('/api/ordenes/registrar-puntos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pedido_id: data[0].id,
                  cliente_dni: state.formData.dni,
                  productos: items.map((i) => ({ id: i.product.id, cantidad: i.quantity, puntos: i.product.puntos || 0 })),
                }),
              })
            } catch (err) {
              console.error('Error registrando puntos:', err)
            }
          }

          // Marcar cupón como usado y descontar YaguaMillas
          if (appliedCoupon?.id && state.formData.dni) {
            try {
              await fetch('/api/cupones/usar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cupon_id: appliedCoupon.id,
                  cliente_dni: state.formData.dni,
                  milestone_millas: (appliedCoupon as { milestone_millas?: number }).milestone_millas || 0,
                }),
              })
            } catch (err) {
              console.error('Error marcando cupón usado:', err)
            }
          }
        }

        if (state.formData.dni) {
          await supabase.from('clientes').upsert({
            dni: state.formData.dni,
            nombre: state.formData.nombre,
            telefono: `+549${state.formData.telefono}`,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'dni' })
        }
      } catch (err) {
        console.error('Error registrando pedido:', err)
      }
    })()
    clearCart()
    onClose()
    dispatch({ type: 'RESET' })
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
            {state.step === 'cart' ? 'Mi Carrito' : 'Datos del pedido'}
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
          {state.step === 'cart' && (
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
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                          {item.product.imagen_url ? (
                            <NextImage
                              src={item.product.imagen_url}
                              alt={item.product.nombre}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="m21 15-5-5L7 21"/>
                              </svg>
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

                  {/* YaguaMillas Info */}
                  {items.some(item => item.product.puntos) && (
                    <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⭐</span>
                        <p className="text-sm font-semibold text-amber-900">YaguaMillas</p>
                      </div>
                      <p className="text-xs text-amber-700 mb-3">
                        Acumularás <span className="font-bold text-amber-600">{items.reduce((total, item) => total + ((item.product.puntos || 0) * item.quantity), 0)} YaguaMillas</span> con esta compra
                      </p>
                      <p className="text-xs text-amber-600 font-semibold">⚠️ Necesitás ingresar tu DNI en el paso 2 para que se acumulen</p>
                    </div>
                  )}


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
                        <p className="font-semibold text-gray-800 text-sm">Envío a domicilio · Gratis</p>
                        <p className="text-xs text-gray-500 mt-0.5">Coordinamos la entrega por WhatsApp</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── STEP 2: Formulario ── */}
          {state.step === 'checkout' && (
            <div className="space-y-5 pb-2">

              {/* ── Entrega ── */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">¿Cómo recibís tu pedido?</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'retiro' as const, label: 'Retiro en tienda',  sub: 'Bv Lehmann 609 · Gratis', icon: MapPin },
                    { value: 'envio' as const,  label: 'Envío a domicilio', sub: 'Gratis',                  icon: Truck  },
                  ] as const).map(({ value, label, sub, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-2 py-4 px-2 border-2 rounded-2xl cursor-pointer transition text-center ${
                        state.formData.deliveryType === value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input type="radio" className="sr-only" checked={state.formData.deliveryType === value} onChange={() => handleDeliveryChange(value as DeliveryType)} />
                      <Icon size={22} className={state.formData.deliveryType === value ? 'text-primary' : 'text-gray-300'} />
                      <div>
                        <p className={`font-bold text-sm leading-tight ${state.formData.deliveryType === value ? 'text-primary' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Dirección (solo si envío) ── */}
              {state.formData.deliveryType === 'envio' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Dirección de entrega <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={state.formData.direccion || ''}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      onBlur={() => { handleBlur('direccion'); setTimeout(() => dispatch({ type: 'SET_SHOW_ADDRESS_SUGGESTIONS', payload: false }), 150) }}
                      onFocus={() => state.addressSuggestions.length > 0 && dispatch({ type: 'SET_SHOW_ADDRESS_SUGGESTIONS', payload: true })}
                      className={`${inputCls(!!state.formErrors.direccion && state.formTouched.direccion)} pr-8`}
                      placeholder="Calle y número..."
                      autoComplete="off"
                    />
                    {state.loadingAddress && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={15} className="text-gray-400 animate-spin" />
                      </div>
                    )}
                    {state.showAddressSuggestions && state.addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        {state.addressSuggestions.map((s, i) => (
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
                  {state.formErrors.direccion && state.formTouched.direccion && (
                    <p className="text-red-500 text-xs mt-1">{state.formErrors.direccion}</p>
                  )}
                </div>
              )}

              {/* ── DNI (opcional) ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  DNI <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={state.formData.dni || ''}
                    onChange={(e) => handleDniChange(e.target.value)}
                    className={`${inputCls(false)} pr-9 ${state.dniState === 'found' ? 'border-green-400 focus:border-green-500' : ''}`}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  {state.dniState === 'loading' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={15} className="text-gray-400 animate-spin" />
                    </div>
                  )}
                  {state.dniState === 'found' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check size={15} className="text-green-500" />
                    </div>
                  )}
                </div>
                {state.dniState === 'found' ? (
                  <p className="text-green-600 text-xs mt-1 font-semibold">¡Te reconocemos! Datos cargados automáticamente.</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">Para que tus próximos pedidos sean más rápidos</p>
                )}
              </div>

              {/* ── Nombre ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={state.formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={inputCls(!!state.formErrors.nombre && state.formTouched.nombre)}
                  placeholder="Tu nombre y apellido"
                />
                {state.formErrors.nombre && state.formTouched.nombre && (
                  <p className="text-red-500 text-xs mt-1">{state.formErrors.nombre}</p>
                )}
              </div>

              {/* ── Teléfono ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className={`flex border rounded-lg overflow-hidden transition focus-within:ring-2 ${
                  state.formErrors.telefono && state.formTouched.telefono
                    ? 'border-red-400 focus-within:ring-red-200'
                    : 'border-gray-300 focus-within:ring-primary/20 focus-within:border-primary'
                }`}>
                  <span className="px-3 py-2 bg-gray-100 text-gray-500 font-medium border-r border-gray-300 shrink-0 select-none text-sm">+549</span>
                  <input
                    type="tel"
                    value={state.formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('telefono')}
                    className="flex-1 px-3 py-2 outline-none text-gray-900 bg-white placeholder-gray-400 text-sm"
                    placeholder="3492XXXXXX"
                    maxLength={12}
                  />
                </div>
                {state.formErrors.telefono && state.formTouched.telefono ? (
                  <p className="text-red-500 text-xs mt-1">{state.formErrors.telefono}</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">10 dígitos, sin el 0 ni el 15</p>
                )}
              </div>

              {/* ── Método de pago ── */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {state.formData.deliveryType === 'retiro' ? '¿Cómo pagás en tienda?' : '¿Cómo pagás el envío?'}
                </p>
                <div className="space-y-2">
                  {([
                    { value: 'debito' as const,   label: 'Débito / Transferencia', desc: 'Precio de lista' },
                    { value: 'efectivo' as const, label: 'Efectivo',               desc: '-10% descuento' },
                    { value: 'credito' as const,  label: 'Tarjeta Crédito',        desc: 'Hasta 3 pagos (con recargo)' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition ${
                        state.formData.metodoPago === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={state.formData.metodoPago === opt.value}
                        onChange={() => dispatch({ type: 'UPDATE_FORM', payload: { metodoPago: opt.value } })}
                        className="w-4 h-4 accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                      {state.formData.metodoPago === opt.value && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* ── YaguaMillas y Cupones ── */}
              {state.dniState === 'found' && (
                <div className="space-y-4">
                  {/* Millas actuales */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⭐</span>
                      <p className="text-sm font-semibold text-amber-900">Mis YaguaMillas</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{(state.clienteActual?.puntos_acumulados) || 0}</p>
                    <p className="text-xs text-amber-700 mt-1">YaguaMillas acumuladas</p>
                  </div>

                  {/* Milestones disponibles para canjear */}
                  {state.milestones.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={18} className="text-green-600" />
                        <p className="text-sm font-semibold text-green-900">Canjeá tus YaguaMillas</p>
                      </div>
                      <div className="space-y-2">
                        {state.milestones.map((milestone) => {
                          const clientMillas = state.clienteActual?.puntos_acumulados || 0
                          const hasEnough = clientMillas >= milestone.millas_requeridas
                          const isApplied = appliedCoupon?.id === milestone.id
                          const isDisabled = (!!appliedCoupon && !isApplied) || !hasEnough
                          return (
                            <button
                              key={milestone.id}
                              onClick={() => hasEnough && applyCoupon(milestone.id, milestone.descuento_porcentaje, milestone.millas_requeridas)}
                              disabled={isDisabled}
                              className={`w-full p-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                                isApplied
                                  ? 'bg-green-600 text-white border-2 border-green-700 cursor-pointer'
                                  : hasEnough
                                  ? 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                  : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <span className="flex flex-col items-start">
                                <span>🎟️ {milestone.descuento_porcentaje}% Descuento</span>
                                <span className={`text-xs font-normal ${isApplied ? 'text-green-100' : hasEnough ? 'text-green-600' : 'text-gray-400'}`}>
                                  {hasEnough
                                    ? `Canjeá ${milestone.millas_requeridas} YaguaMillas`
                                    : `Te faltan ${milestone.millas_requeridas - clientMillas} YaguaMillas`}
                                </span>
                              </span>
                              {isApplied && <Check size={16} />}
                            </button>
                          )
                        })}
                      </div>
                      {appliedCoupon && (
                        <div className="mt-3 p-2 bg-white border-2 border-green-300 rounded-lg flex items-center justify-between text-xs">
                          <p className="text-green-700 font-semibold">✓ Ahorrarás {formatPrice(total * appliedCoupon.descuento_porcentaje / 100)}</p>
                          <button
                            onClick={removeCoupon}
                            className="text-green-600 hover:text-green-800 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {state.loadingCupones && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                      <p className="text-sm text-yellow-800">⏳ Cargando opciones disponibles...</p>
                    </div>
                  )}

                </div>
              )}

              {/* ── Puntos de esta compra ── */}
              {items.length > 0 && !state.clienteActual && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <PuntosInfo items={items} clienteActual={state.clienteActual} />
                </div>
              )}

              {/* ── Resumen ── */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tu pedido</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{item.product.nombre} ×{item.quantity}</span>
                    <span className="text-gray-900 font-semibold shrink-0">{formatPrice(item.product.precio * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 mt-1 space-y-1">
                  {(appliedCoupon || state.formData.metodoPago === 'efectivo') && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-rose-600 font-semibold">
                      <span>Descuento ({appliedCoupon.descuento_porcentaje}%)</span>
                      <span>-{formatPrice(total * appliedCoupon.descuento_porcentaje / 100)}</span>
                    </div>
                  )}
                  {state.formData.metodoPago === 'efectivo' && (
                    <div className="flex justify-between text-sm text-rose-600 font-semibold">
                      <span>Descuento efectivo (10%)</span>
                      <span>-{formatPrice((appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total) * 0.1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-primary font-bold text-xl">
                      {formatPrice((appliedCoupon ? total * (1 - appliedCoupon.descuento_porcentaje / 100) : total) * (state.formData.metodoPago === 'efectivo' ? 0.9 : 1))}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2 shrink-0">
          {state.step === 'cart' && items.length > 0 && (
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
              {state.stockErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                  {state.stockErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
              <button
                onClick={handleContinuar}
                disabled={state.checkingStock}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {state.checkingStock ? (
                  <><Loader2 size={18} className="animate-spin" /> Verificando stock...</>
                ) : 'Continuar →'}
              </button>
            </>
          )}

          {state.step === 'checkout' && (
            <>
              <button
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'cart' })}
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

      {/* Modal Confirmación YaguaMillas */}
      {state.showYaguamillasConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-8 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="text-2xl font-bold text-amber-900">¡Felicidades!</h3>
              <p className="text-amber-800 mt-2">Acabás de acumular YaguaMillas</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8 space-y-6">
              {/* Millas Count */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                <p className="text-sm text-amber-700 font-semibold uppercase tracking-wide mb-2">
                  YaguaMillas acumulados
                </p>
                <p className="text-5xl font-bold text-amber-600">
                  +{state.yaguamillasConfirmData.cantidad}
                </p>
              </div>

              {/* Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-semibold text-gray-900">{state.yaguamillasConfirmData.nombre}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">DNI:</span>
                  <span className="font-semibold text-gray-900">{state.yaguamillasConfirmData.dni}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">
                  ℹ️ Estos YaguaMillas se acumularán cuando confirmes tu compra por WhatsApp
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <a
                  href="/mis-yaguamillas"
                  className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition text-center text-sm"
                >
                  Ver mis YaguaMillas
                </a>
                <button
                  onClick={() => {
                    dispatch({ type: 'HIDE_YAGUAMILLAS_CONFIRM' })
                    onClose()
                    dispatch({ type: 'RESET' })
                  }}
                  className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}