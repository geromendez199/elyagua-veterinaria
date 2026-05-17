import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const { cupon_id, pedido_id } = await request.json()

    if (!cupon_id || !pedido_id) {
      return errorResponse('cupon_id y pedido_id requeridos')
    }

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
