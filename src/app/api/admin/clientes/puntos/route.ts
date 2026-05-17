import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse } from '@/lib/api/response'

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const { cliente_id, cantidad, motivo } = body

    if (!cliente_id || cantidad === undefined || !motivo) {
      return errorResponse('Datos incompletos')
    }

    const cantidadInt = parseInt(cantidad)
    if (isNaN(cantidadInt)) {
      return errorResponse('Cantidad debe ser un número')
    }

    const { data, error: rpcError } = await supabase.rpc('adjust_puntos_manual', {
      p_cliente_id: cliente_id,
      p_cantidad: cantidadInt,
      p_motivo: motivo,
    })

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return errorResponse(rpcError.message, 500)
    }

    if (!data) {
      return errorResponse('No se pudo procesar el ajuste', 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('PATCH /api/admin/clientes/puntos error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}
