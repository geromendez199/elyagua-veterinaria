import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: Request) {
  try {
    const { pedido_id, cliente_dni, productos } = await request.json()

    if (!cliente_dni || !productos || !Array.isArray(productos)) {
      return errorResponse('Datos incompletos')
    }

    if (pedido_id) {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('id')
        .eq('id', pedido_id)
        .single()

      if (!pedido) {
        return errorResponse('Pedido no encontrado')
      }
    }

    const { data, error } = await supabase.rpc('add_puntos_from_order', {
      p_cliente_dni: cliente_dni,
      p_pedido_id: pedido_id,
      p_productos: JSON.stringify(productos),
    })

    if (error) {
      console.error('RPC error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('POST /api/ordenes/registrar-puntos error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

// 20 requests per 15 minutes
export const POST = withRateLimit(handler, { limit: 20, windowMs: 15 * 60 * 1000 }, 'ordenes-registrar')
