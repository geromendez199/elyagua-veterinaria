import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return errorResponse('DNI requerido')
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
