import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse, dbErrorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'
import { createMilestoneSchema, updateMilestoneSchema, type CreateMilestoneInput, type UpdateMilestoneInput } from '@/lib/validation/schemas'
import { validateRequest } from '@/lib/validation/validate-request'

async function getHandler(_request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data, error: dbError } = await supabase
      .from('milestones')
      .select('*')
      .order('millas_requeridas', { ascending: true })

    if (dbError) {
      return dbErrorResponse('admin/milestones GET', dbError, 'No se pudieron obtener los milestones')
    }

    return successResponse(data)
  } catch (error) {
    return dbErrorResponse('admin/milestones GET', error)
  }
}

async function postHandler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data, error: validationError } = await validateRequest<CreateMilestoneInput>(request, createMilestoneSchema)
    if (validationError || !data) return validationError || errorResponse('Datos inválidos', 400)

    const { millas_requeridas, descuento_porcentaje, activo } = data

    const { data: dbData, error: dbError } = await supabase
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
      return dbErrorResponse('admin/milestones POST', dbError, 'No se pudo crear el milestone')
    }

    return successResponse(dbData?.[0])
  } catch (error) {
    return dbErrorResponse('admin/milestones POST', error)
  }
}

async function putHandler(request: Request) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { data, error: validationError } = await validateRequest<UpdateMilestoneInput>(request, updateMilestoneSchema)
    if (validationError || !data) return validationError || errorResponse('Datos inválidos', 400)

    const { id, millas_requeridas, descuento_porcentaje, activo } = data

    const { data: dbData, error: dbError } = await supabase
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
      return dbErrorResponse('admin/milestones PUT', dbError, 'No se pudo actualizar el milestone')
    }

    return successResponse(dbData?.[0])
  } catch (error) {
    return dbErrorResponse('admin/milestones PUT', error)
  }
}

async function deleteHandler(request: Request) {
  try {
    const { error } = await requireAuth()
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
      return dbErrorResponse('admin/milestones DELETE', dbError, 'No se pudo eliminar el milestone')
    }

    return successResponse({})
  } catch (error) {
    return dbErrorResponse('admin/milestones DELETE', error)
  }
}

// Rate limiting
export const GET = withRateLimit(getHandler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'admin-milestones-get')
export const POST = withRateLimit(postHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-post')
export const PUT = withRateLimit(putHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-put')
export const DELETE = withRateLimit(deleteHandler, { limit: 5, windowMs: 15 * 60 * 1000 }, 'admin-milestones-delete')
