import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'
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
      return errorResponse(error.message, 500)
    }

    return successResponse({})
  } catch (error) {
    console.error('POST /api/admin/cupones/usar error:', error)
    return errorResponse('Error interno', 500)
  }
}

export const POST = withRateLimit(handler, { limit: 10, windowMs: 15 * 60 * 1000 }, 'admin-cupones-usar')
