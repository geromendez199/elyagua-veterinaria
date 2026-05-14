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

    const { producto_id, puntos } = await request.json()

    if (!producto_id || puntos === undefined) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validar que puntos sea un número entero no negativo
    const puntosInt = parseInt(puntos)
    if (isNaN(puntosInt) || puntosInt < 0) {
      return Response.json(
        { success: false, error: 'Puntos debe ser un número entero no negativo' },
        { status: 400 }
      )
    }

    // Actualizar puntos del producto
    const { data, error } = await supabase
      .from('productos')
      .update({ puntos: puntosInt, updated_at: new Date().toISOString() })
      .eq('id', producto_id)
      .select('id, nombre, puntos')
      .single()

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      producto_id: data.id,
      nombre: data.nombre,
      puntos_nuevo: data.puntos,
    })
  } catch (error) {
    console.error('Error updating product points:', error)
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
