import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { useCouponSchema, type UseCouponInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function handler(request: Request) {
  try {
    const { data, error } = await validateRequest<UseCouponInput>(request, useCouponSchema)
    if (error || !data) return error || errorResponse('Datos inválidos', 400)

    const { cupon_id, cliente_dni, milestone_millas } = data

    const { error: updateCuponError } = await supabase
      .from('cupones')
      .update({ activo: false })
      .eq('id', cupon_id)

    if (updateCuponError) {
      console.error('Error marking coupon as used:', updateCuponError)
      return errorResponse('Error al procesar cupón', 500)
    }

    if (milestone_millas && milestone_millas > 0) {
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('puntos_acumulados')
          .eq('dni', cliente_dni)
          .single()

        if (cliente) {
          const newPoints = Math.max(0, (cliente.puntos_acumulados || 0) - milestone_millas)
          await supabase
            .from('clientes')
            .update({ puntos_acumulados: newPoints })
            .eq('dni', cliente_dni)
        }
      } catch (e) {
        console.error('Error deducting points:', e)
      }
    }

    return successResponse({
      message: 'Cupón utilizado exitosamente'
    })
  } catch (err) {
    console.error('POST /api/cupones/usar error:', err)
    return errorResponse('Error interno del servidor', 500)
  }
}

// 10 requests per 15 minutes
export const POST = withRateLimit(handler, { limit: 10, windowMs: 15 * 60 * 1000 }, 'cupones-usar')
