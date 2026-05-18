import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return errorResponse('DNI requerido')
    }

    if (!/^\d{7,8}$/.test(dni)) {
      return errorResponse('DNI inválido')
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, dni, nombre, puntos_acumulados')
      .eq('dni', dni)
      .single()

    if (error || !cliente) {
      return successResponse({
        puntos_acumulados: 0,
        cliente_encontrado: false,
        mensaje: 'Cliente no registrado aún',
      })
    }

    return successResponse({
      cliente_id: cliente.id,
      nombre: cliente.nombre,
      puntos_acumulados: cliente.puntos_acumulados || 0,
      cliente_encontrado: true,
    })
  } catch (error) {
    console.error('GET /api/clientes/puntos error:', error)
    return errorResponse('Error interno del servidor', 500)
  }
}

// 30 requests per 15 minutes (higher for GET)
export const GET = withRateLimit(handler, { limit: 30, windowMs: 15 * 60 * 1000 }, 'clientes-puntos')
