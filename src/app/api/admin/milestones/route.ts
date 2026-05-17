import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'

async function getHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { data, error: dbError } = await supabase
      .from('milestones')
      .select('*')
      .order('millas_requeridas', { ascending: true })

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('GET /api/admin/milestones error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

async function postHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { millas_requeridas, descuento_porcentaje, activo } = await request.json()

    if (!millas_requeridas || !descuento_porcentaje) {
      return errorResponse('Faltan datos requeridos')
    }

    const { data, error: dbError } = await supabase
      .from('milestones')
      .insert([
        {
          millas_requeridas,
          descuento_porcentaje,
          activo: activo !== false,
        },
      ])
      .select()

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse(data?.[0])
  } catch (error) {
    console.error('POST /api/admin/milestones error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

async function putHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id, millas_requeridas, descuento_porcentaje, activo } = await request.json()

    if (!id) {
      return errorResponse('ID requerido')
    }

    const { data, error: dbError } = await supabase
      .from('milestones')
      .update({
        millas_requeridas,
        descuento_porcentaje,
        activo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse(data?.[0])
  } catch (error) {
    console.error('PUT /api/admin/milestones error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

async function deleteHandler(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('ID requerido')
    }

    const { error: dbError } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)

    if (dbError) {
      return errorResponse(dbError.message, 500)
    }

    return successResponse({})
  } catch (error) {
    console.error('DELETE /api/admin/milestones error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

// Rate limiting
export const GET = withRateLimit(getHandler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-milestones-get')
export const POST = withRateLimit(postHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-post')
export const PUT = withRateLimit(putHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-put')
export const DELETE = withRateLimit(deleteHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-delete')
