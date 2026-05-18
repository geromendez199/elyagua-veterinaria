import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse, dbErrorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { useAdminCuponSchema, type UseAdminCuponInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function handler(request: Request) {
  try {
    const { error: authError } = await requireAuth()
    if (authError) return authError

    const { data: input, error: validationError } = await validateRequest<UseAdminCuponInput>(request, useAdminCuponSchema)
    if (validationError || !input) return validationError || errorResponse('Datos inválidos', 400)

    const { cupon_id, pedido_id } = input

    const { error } = await supabase
      .from('cupones')
      .update({
        usado: true,
        usado_en_pedido: pedido_id,
        used_at: new Date().toISOString(),
      })
      .eq('id', cupon_id)

    if (error) {
      return dbErrorResponse('admin/cupones/usar POST', error, 'No se pudo marcar el cupón')
    }

    return successResponse({})
  } catch (error) {
    return dbErrorResponse('admin/cupones/usar POST', error)
  }
}

export const POST = withRateLimit(handler, { limit: 10, windowMs: 15 * 60 * 1000 }, 'admin-cupones-usar')
