import { Oferta } from '@/types'

export interface CartItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
  puntos?: number
}

export async function fetchAvailableOffers(): Promise<Oferta[]> {
  try {
    const response = await fetch('/api/ofertas')
    if (!response.ok) return []
    const { data } = await response.json()
    return data || []
  } catch (error) {
    console.error('Error fetching offers:', error)
    return []
  }
}

export function getApplicableOffers(
  cartItems: CartItem[],
  ofertas: Oferta[]
): Oferta[] {
  if (cartItems.length === 0) return []

  const cartProductIds = new Set(cartItems.map((item) => item.id))

  return ofertas.filter((oferta) => {
    if (!oferta.productos || oferta.productos.length === 0) return false

    if (oferta.tipo === 'porcentaje') {
      // For percentage offers: at least one product must be in cart
      return oferta.productos.some((p) => cartProductIds.has(p.producto_id))
    }

    if (oferta.tipo === 'combo') {
      // For combos: ALL products must be in cart with required quantities
      return oferta.productos.every((p) => {
        const cartItem = cartItems.find((item) => item.id === p.producto_id)
        if (!cartItem) return false
        // Check if quantity requirement is met (if specified)
        if (p.cantidad && cartItem.cantidad < p.cantidad) return false
        return true
      })
    }

    return false
  })
}

export function calculateOfferSavings(
  oferta: Oferta,
  cartItems: CartItem[]
): { amount: number; originalPrice: number; finalPrice: number } {
  if (!oferta.productos) {
    return { amount: 0, originalPrice: 0, finalPrice: 0 }
  }

  let originalPrice = 0
  let discountedPrice = 0

  if (oferta.tipo === 'porcentaje' && oferta.descuento_porcentaje) {
    // Calculate original price of qualifying products
    oferta.productos.forEach((p) => {
      const cartItem = cartItems.find((item) => item.id === p.producto_id)
      if (cartItem) {
        originalPrice += cartItem.precio * cartItem.cantidad
      }
    })

    const discount = (originalPrice * oferta.descuento_porcentaje) / 100
    discountedPrice = originalPrice - discount

    return {
      amount: discount,
      originalPrice,
      finalPrice: discountedPrice,
    }
  }

  if (oferta.tipo === 'combo' && oferta.precio_especial) {
    // For combos, calculate total original price of combo items
    oferta.productos.forEach((p) => {
      const cartItem = cartItems.find((item) => item.id === p.producto_id)
      if (cartItem) {
        const qty = p.cantidad || 1
        originalPrice += cartItem.precio * qty
      }
    })

    const savings = originalPrice - oferta.precio_especial

    return {
      amount: savings,
      originalPrice,
      finalPrice: oferta.precio_especial,
    }
  }

  return { amount: 0, originalPrice, finalPrice: originalPrice }
}

export function applyOfferToCartTotal(
  cartTotal: number,
  appliedOffer: Oferta | null,
  cartItems: CartItem[]
): number {
  if (!appliedOffer || !cartItems.length) return cartTotal

  if (appliedOffer.tipo === 'porcentaje' && appliedOffer.descuento_porcentaje) {
    // Only discount the applicable products
    let applicableTotal = 0
    appliedOffer.productos?.forEach((p) => {
      const cartItem = cartItems.find((item) => item.id === p.producto_id)
      if (cartItem) {
        applicableTotal += cartItem.precio * cartItem.cantidad
      }
    })

    const discount = (applicableTotal * appliedOffer.descuento_porcentaje) / 100
    return cartTotal - discount
  }

  if (appliedOffer.tipo === 'combo' && appliedOffer.precio_especial) {
    // For combo: replace combo items price with special price
    let nonComboTotal = 0
    const comboProductIds = new Set(appliedOffer.productos?.map((p) => p.producto_id))

    cartItems.forEach((item) => {
      if (!comboProductIds.has(item.id)) {
        nonComboTotal += item.precio * item.cantidad
      }
    })

    return nonComboTotal + appliedOffer.precio_especial
  }

  return cartTotal
}

// Function to determine which items will be excluded from YaguaMillas
export function getProductosExcludedFromPoints(appliedOffer: Oferta | null): Set<string> {
  if (!appliedOffer || !appliedOffer.productos) return new Set()

  // For both types, exclude the offer products from points calculation
  return new Set(appliedOffer.productos.map((p) => p.producto_id))
}
