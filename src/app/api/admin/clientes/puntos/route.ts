import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse, dbErrorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { adjustClientePuntosSchema, type AdjustClientePuntosInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function handler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data: input, error: validationError } = await validateRequest<AdjustClientePuntosInput>(request, adjustClientePuntosSchema)
    if (validationError || !input) return validationError || errorResponse('Datos inválidos', 400)

    const { cliente_id, cantidad, motivo } = input

    const { data, error: rpcError } = await supabase.rpc('adjust_puntos_manual', {
      p_cliente_id: cliente_id,
      p_cantidad: cantidad,
      p_motivo: motivo,
    })

    if (rpcError) {
      return dbErrorResponse('admin/clientes/puntos PATCH', rpcError, 'No se pudo ajustar los puntos')
    }

    if (!data) {
      return errorResponse('No se pudo procesar el ajuste', 500)
    }

    return successResponse(data)
  } catch (error) {
    return dbErrorResponse('admin/clientes/puntos PATCH', error)
  }
}

export const PATCH = withRateLimit(handler, { limit: 10, windowMs: 15 * 60 * 1000 }, 'admin-clientes-puntos')
