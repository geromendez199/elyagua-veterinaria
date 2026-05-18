import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { producto_id, puntos } = await request.json()

    if (!producto_id || puntos === undefined) {
      return errorResponse('Datos incompletos')
    }

    const puntosInt = parseInt(puntos)
    if (isNaN(puntosInt) || puntosInt < 0) {
      return errorResponse('Puntos debe ser un número entero no negativo')
    }

    const { data, error: dbError } = await supabase
      .from('productos')
      .update({ puntos: puntosInt, updated_at: new Date().toISOString() })
      .eq('id', producto_id)
      .select('id, nombre, puntos')
      .single()

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse({
      producto_id: data.id,
      nombre: data.nombre,
      puntos_nuevo: data.puntos,
    })
  } catch (error) {
    console.error('PATCH /api/admin/productos/puntos error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

export const PATCH = withRateLimit(handler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-productos-puntos')
