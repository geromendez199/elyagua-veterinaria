import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return Response.json(
        { success: false, error: 'DNI requerido' },
        { status: 400 }
      )
    }

    // Buscar cliente por DNI
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, dni, nombre, puntos_acumulados')
      .eq('dni', dni)
      .single()

    if (error || !cliente) {
      // Cliente no existe, retornar 0 puntos
      return Response.json({
        success: true,
        puntos_acumulados: 0,
        cliente_encontrado: false,
        mensaje: 'Cliente no registrado aún',
      })
    }

    return Response.json({
      success: true,
      cliente_id: cliente.id,
      nombre: cliente.nombre,
      puntos_acumulados: cliente.puntos_acumulados || 0,
      cliente_encontrado: true,
    })
  } catch (error) {
    console.error('Error fetching points:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
