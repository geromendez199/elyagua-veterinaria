import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'

export async function GET() {
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

export async function POST(request: Request) {
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

export async function PUT(request: Request) {
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

export async function DELETE(request: Request) {
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
