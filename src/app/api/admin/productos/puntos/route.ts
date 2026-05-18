import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse, dbErrorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { updateProductoPuntosSchema, type UpdateProductoPuntosInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function handler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data: input, error: validationError } = await validateRequest<UpdateProductoPuntosInput>(request, updateProductoPuntosSchema)
    if (validationError || !input) return validationError || errorResponse('Datos inválidos', 400)

    const { producto_id, puntos } = input

    const { data, error: dbError } = await supabase
      .from('productos')
      .update({ puntos, updated_at: new Date().toISOString() })
      .eq('id', producto_id)
      .select('id, nombre, puntos')
      .single()

    if (dbError) {
      return dbErrorResponse('admin/productos/puntos PATCH', dbError, 'No se pudieron actualizar los puntos')
    }

    return successResponse({
      producto_id: data.id,
      nombre: data.nombre,
      puntos_nuevo: data.puntos,
    })
  } catch (error) {
    return dbErrorResponse('admin/productos/puntos PATCH', error)
  }
}

export const PATCH = withRateLimit(handler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-productos-puntos')
