import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const { cupon_id, cliente_dni, milestone_millas } = await request.json()

    if (!cupon_id || !cliente_dni) {
      return errorResponse('Datos incompletos')
    }

    const { error: updateCuponError } = await supabase
      .from('cupones')
      .update({ activo: false })
      .eq('id', cupon_id)

    if (updateCuponError) {
      console.error('Error marking coupon as used:', updateCuponError)
      return errorResponse('Error al procesar cupón', 500)
    }

    if (milestone_millas && milestone_millas > 0) {
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('puntos_acumulados')
          .eq('dni', cliente_dni)
          .single()

        if (cliente) {
          const newPoints = Math.max(0, (cliente.puntos_acumulados || 0) - milestone_millas)
          await supabase
            .from('clientes')
            .update({ puntos_acumulados: newPoints })
            .eq('dni', cliente_dni)
        }
      } catch (e) {
        console.error('Error deducting points:', e)
      }
    }

    return successResponse({
      message: 'Cupón utilizado exitosamente'
    })
  } catch (err) {
    console.error('POST /api/cupones/usar error:', err)
    return errorResponse('Error interno del servidor', 500)
  }
}
