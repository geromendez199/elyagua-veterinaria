import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { pedido_id, cliente_dni, productos } = await request.json()

    if (!cliente_dni || !productos || !Array.isArray(productos)) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validate that pedido exists if provided
    if (pedido_id) {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('id')
        .eq('id', pedido_id)
        .single()

      if (!pedido) {
        return Response.json(
          { success: false, error: 'Pedido no encontrado' },
          { status: 400 }
        )
      }
    }

    // Llamar función RPC para registrar puntos
    const { data, error } = await supabase.rpc('add_puntos_from_order', {
      p_cliente_dni: cliente_dni,
      p_pedido_id: pedido_id,
      p_productos: JSON.stringify(productos),
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
    console.error('Error registering points:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
