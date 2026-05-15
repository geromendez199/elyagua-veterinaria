import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { cliente_id, cantidad, motivo } = body

    console.log('Recibido:', { cliente_id, cantidad, motivo })

    if (!cliente_id || cantidad === undefined || !motivo) {
      console.error('Datos incompletos:', { cliente_id, cantidad, motivo })
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validar que cantidad sea un número entero
    const cantidadInt = parseInt(cantidad)
    if (isNaN(cantidadInt)) {
      console.error('Cantidad no es un número:', cantidad)
      return Response.json(
        { success: false, error: 'Cantidad debe ser un número' },
        { status: 400 }
      )
    }

    console.log('Llamando RPC con:', { p_cliente_id: cliente_id, p_cantidad: cantidadInt, p_motivo: motivo })

    // Llamar función RPC para ajustar puntos
    const { data, error } = await supabase.rpc('adjust_puntos_manual', {
      p_cliente_id: cliente_id,
      p_cantidad: cantidadInt,
      p_motivo: motivo,
    })

    console.log('Respuesta RPC:', { data, error })

    if (error) {
      console.error('RPC error:', error)
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('RPC returned no data')
      return Response.json(
        { success: false, error: 'No se pudo procesar el ajuste' },
        { status: 500 }
      )
    }

    console.log('Retornando:', { success: true, ...data })
    return Response.json({ success: true, ...data })
  } catch (error) {
    console.error('Error adjusting client points:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
