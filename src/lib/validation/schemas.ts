import { z } from 'zod'

// ── Frontend Schemas ────────────────────────────────────────────
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

export const addressSchema = z.object({
  calle: z.string().min(2, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  piso: z.string().optional(),
  departamento: z.string().optional(),
  localidad: z.string().min(2, 'Localidad requerida'),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido'),
})

// ── API Schemas ────────────────────────────────────────────────
export const useCouponSchema = z.object({
  cupon_id: z.string().uuid('Cupón inválido'),
  cliente_dni: z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  milestone_millas: z.number().int().nonnegative().optional(),
})

export const registerPointsSchema = z.object({
  pedido_id: z.string().uuid('ID de pedido inválido').optional(),
  cliente_dni: z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  productos: z.array(
    z.object({
      id: z.string().uuid('ID de producto inválido'),
      cantidad: z.number().int().positive('Cantidad debe ser positiva'),
      puntos: z.number().int().nonnegative('Puntos no puede ser negativo'),
    })
  ).min(1, 'Debe tener al menos un producto'),
})

export const createCouponSchema = z.object({
  cliente_id: z.string().uuid('ID de cliente inválido'),
  cliente_puntos: z.number().int().nonnegative('Puntos no puede ser negativo'),
})

export const createMilestoneSchema = z.object({
  millas_requeridas: z.number().int().positive('Millas debe ser positivo'),
  descuento_porcentaje: z.number().int().min(1).max(100, 'Descuento debe estar entre 1 y 100'),
  activo: z.boolean().optional().default(true),
})

export const updateMilestoneSchema = z.object({
  id: z.string().uuid('ID inválido'),
  millas_requeridas: z.number().int().positive('Millas debe ser positivo'),
  descuento_porcentaje: z.number().int().min(1).max(100, 'Descuento debe estar entre 1 y 100'),
  activo: z.boolean().optional(),
})

export const createMascotaSchema = z.object({
  cliente_id: z.string().uuid('ID de cliente inválido'),
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  especie: z.string().min(1, 'Especie requerida').max(50),
  raza: z.string().max(100).optional().nullable(),
  edad: z.string().max(50).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  peso: z.string().max(50).optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
})

export const updateProductoPuntosSchema = z.object({
  producto_id: z.string().uuid('ID de producto inválido'),
  puntos: z.number().int().nonnegative('Puntos no puede ser negativo'),
})

export const adjustClientePuntosSchema = z.object({
  cliente_id: z.string().uuid('ID de cliente inválido'),
  cantidad: z.number().int('Cantidad debe ser un número entero'),
  motivo: z.string().min(1, 'Motivo requerido').max(500),
})

export const useAdminCuponSchema = z.object({
  cupon_id: z.string().uuid('Cupón inválido'),
  pedido_id: z.string().uuid('Pedido inválido'),
})

// ── Type Exports ───────────────────────────────────────────────
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type DniInput = z.infer<typeof dniSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type UseCouponInput = z.infer<typeof useCouponSchema>
export type RegisterPointsInput = z.infer<typeof registerPointsSchema>
export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
export type CreateMascotaInput = z.infer<typeof createMascotaSchema>
export type UpdateProductoPuntosInput = z.infer<typeof updateProductoPuntosSchema>
export type AdjustClientePuntosInput = z.infer<typeof adjustClientePuntosSchema>
export type UseAdminCuponInput = z.infer<typeof useAdminCuponSchema>
