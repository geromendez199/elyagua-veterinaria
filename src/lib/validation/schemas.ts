import { z } from 'zod'

export const checkoutFormSchema = z.object({
  nombreCompleto: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7-8 dígitos'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\d{7,15}$/, 'Teléfono inválido'),
  calle: z.string().min(3, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  piso: z.string().optional(),
  departamento: z.string().optional(),
  localidad: z.string().min(2, 'Localidad requerida'),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido'),
  metodoPago: z.enum(['efectivo', 'debito']),
  deliveryType: z.enum(['retiro', 'envio']),
})

export const dniSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
})

export const couponSchema = z.object({
  cupon_id: z.string().uuid('Cupón inválido'),
  cliente_dni: z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  milestone_millas: z.number().int().nonnegative().optional(),
})

export const addressSchema = z.object({
  calle: z.string().min(2, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  piso: z.string().optional(),
  departamento: z.string().optional(),
  localidad: z.string().min(2, 'Localidad requerida'),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido'),
})

// Type exports
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type DniInput = z.infer<typeof dniSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type AddressInput = z.infer<typeof addressSchema>
