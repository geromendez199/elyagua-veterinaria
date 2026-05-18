import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { createMascotaSchema, type CreateMascotaInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function postHandler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data: input, error: validationError } = await validateRequest<CreateMascotaInput>(request, createMascotaSchema)
    if (validationError || !input) return validationError || errorResponse('Datos inválidos', 400)

    const { cliente_id, nombre, especie, raza, edad, color, peso, observaciones } = input

    const { data, error: dbError } = await supabase
      .from('mascotas')
      .insert([{
        cliente_id,
        nombre,
        especie,
        raza: raza || null,
        edad: edad || null,
        color: color || null,
        peso: peso || null,
        observaciones: observaciones || null,
      }])
      .select()

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('POST /api/admin/mascotas error:', error)
    return errorResponse('Error interno', 500)
  }
}

async function deleteHandler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const mascotaId = searchParams.get('id')

    if (!mascotaId) {
      return errorResponse('ID requerido')
    }

    const { error: dbError } = await supabase
      .from('mascotas')
      .delete()
      .eq('id', mascotaId)

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse({})
  } catch (error) {
    console.error('DELETE /api/admin/mascotas error:', error)
    return errorResponse('Error interno', 500)
  }
}

export const POST = withRateLimit(postHandler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-mascotas-post')
export const DELETE = withRateLimit(deleteHandler, { limit: 10, windowMs: 15 * 60 * 1000 }, 'admin-mascotas-delete')
