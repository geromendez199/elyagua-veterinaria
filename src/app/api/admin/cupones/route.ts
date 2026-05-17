import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { createCouponSchema, type CreateCouponInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function postHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { data, error: validationError } = await validateRequest<CreateCouponInput>(request, createCouponSchema)
    if (validationError || !data) return validationError || errorResponse('Datos inválidos', 400)

    const { cliente_id, cliente_puntos } = data

    // Calcular cuántos cupones puede generar (100 YaguaMillas = 1 cupón de 10%)
    const cuponesPosibles = Math.floor(cliente_puntos / 100)

    if (cuponesPosibles === 0) {
      return successResponse({
        cupones_generados: 0,
        cupones_disponibles: 0,
        mensaje: 'Cliente no tiene suficientes YaguaMillas para generar cupones',
      })
    }

    const { data: cuponesExistentes } = await supabase
      .from('cupones')
      .select('id')
      .eq('cliente_id', cliente_id)
      .eq('usado', false)

    const cuponesActuales = cuponesExistentes?.length || 0
    const cuponesNecesarios = cuponesPosibles - cuponesActuales

    if (cuponesNecesarios <= 0) {
      return successResponse({
        cupones_generados: 0,
        cupones_disponibles: cuponesActuales,
        mensaje: 'Cliente ya tiene todos sus cupones disponibles',
      })
    }

    const nuevosCupones = Array.from({ length: cuponesNecesarios }, () => ({
      cliente_id,
      yaguamillas_requeridos: 100,
      porcentaje_descuento: 10,
      usado: false,
    }))

    const { error: insertError } = await supabase
      .from('cupones')
      .insert(nuevosCupones)

    if (insertError) {
      return errorResponse(insertError.message, 500)
    }

    return successResponse({
      cupones_generados: cuponesNecesarios,
      cupones_disponibles: cuponesPosibles,
    })
  } catch (error) {
    console.error('POST /api/admin/cupones error:', error)
    return errorResponse('Error interno', 500)
  }
}

async function getHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const cliente_id = searchParams.get('cliente_id')

    if (!cliente_id) {
      return errorResponse('cliente_id requerido')
    }

    const { data, error: dbError } = await supabase
      .from('cupones')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('usado', false)
      .order('created_at', { ascending: true })

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse({
      cupones_disponibles: data?.length || 0,
      cupones: data || [],
    })
  } catch (error) {
    console.error('GET /api/admin/cupones error:', error)
    return errorResponse('Error interno', 500)
  }
}

// 5 requests per 15 minutes for POST (creating cupones)
export const POST = withRateLimit(postHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-cupones-post')

// 20 requests per 15 minutes for GET
export const GET = withRateLimit(getHandler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-cupones-get')
