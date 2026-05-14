import { supabase } from '@/lib/supabase'

export async function PATCH(request: Request) {
  try {
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { cliente_id, cantidad, motivo } = await request.json()

    if (!cliente_id || cantidad === undefined || !motivo) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validar que cantidad sea un número entero
    const cantidadInt = parseInt(cantidad)
    if (isNaN(cantidadInt)) {
      return Response.json(
        { success: false, error: 'Cantidad debe ser un número' },
        { status: 400 }
      )
    }

    // Llamar función RPC para ajustar puntos
    const { data, error } = await supabase.rpc('adjust_puntos_manual', {
      p_cliente_id: cliente_id,
      p_cantidad: cantidadInt,
      p_motivo: motivo,
    })

    if (error) {
      console.error('RPC error:', error)
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error adjusting client points:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
