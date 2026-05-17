import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { cupon_id, cliente_dni, milestone_millas } = await request.json()

    if (!cupon_id || !cliente_dni) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Marcar cupón como inactivo (usado)
    const { error: updateCuponError } = await supabase
      .from('cupones')
      .update({ activo: false })
      .eq('id', cupon_id)

    if (updateCuponError) {
      console.error('Error marking coupon as used:', updateCuponError)
      return Response.json(
        { success: false, error: 'Error al procesar cupón' },
        { status: 500 }
      )
    }

    // Descontar YaguaMillas si se proporcionan
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
        // No fallar si no se descuentan puntos
      }
    }

    return Response.json({
      success: true,
      message: 'Cupón utilizado exitosamente'
    })
  } catch (err) {
    console.error('Error using coupon:', err)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
