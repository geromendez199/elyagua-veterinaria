import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { cliente_id, cliente_puntos } = await request.json()

    if (!cliente_id || cliente_puntos === undefined) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Calcular cuántos cupones puede generar (100 YaguaMillas = 1 cupón de 10%)
    const cuponesPosibles = Math.floor(cliente_puntos / 100)

    if (cuponesPosibles === 0) {
      return Response.json({
        success: true,
        cupones_generados: 0,
        cupones_disponibles: 0,
        mensaje: 'Cliente no tiene suficientes YaguaMillas para generar cupones',
      })
    }

    // Obtener cupones ya existentes sin usar
    const { data: cuponesExistentes } = await supabase
      .from('cupones')
      .select('id')
      .eq('cliente_id', cliente_id)
      .eq('usado', false)

    const cuponesActuales = cuponesExistentes?.length || 0
    const cuponesNecesarios = cuponesPosibles - cuponesActuales

    if (cuponesNecesarios <= 0) {
      return Response.json({
        success: true,
        cupones_generados: 0,
        cupones_disponibles: cuponesActuales,
        mensaje: 'Cliente ya tiene todos sus cupones disponibles',
      })
    }

    // Generar nuevos cupones
    const nuevosCupones = Array.from({ length: cuponesNecesarios }, () => ({
      cliente_id,
      yaguamillas_requeridos: 100,
      porcentaje_descuento: 10,
      usado: false,
    }))

    const { error: insertError } = await supabase
      .from('cupones')
      .insert(nuevosCupones)

    if (insertError) {
      return Response.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      cupones_generados: cuponesNecesarios,
      cupones_disponibles: cuponesPosibles,
    })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cliente_id = searchParams.get('cliente_id')

    if (!cliente_id) {
      return Response.json(
        { success: false, error: 'cliente_id requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('usado', false)
      .order('created_at', { ascending: true })

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      cupones_disponibles: data?.length || 0,
      cupones: data || [],
    })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}
