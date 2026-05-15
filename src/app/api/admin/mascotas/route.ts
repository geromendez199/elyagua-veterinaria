import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cliente_id, nombre, especie, raza, edad, color, peso, observaciones } = body

    if (!cliente_id || !nombre || !especie) {
      return Response.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('mascotas')
      .insert([{
        cliente_id,
        nombre,
        especie,
        raza: raza || null,
        edad: edad || null,
        color: color || null,
        peso: peso || null,
        observaciones: observaciones || null,
      }])
      .select()

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mascotaId = searchParams.get('id')

    if (!mascotaId) {
      return Response.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('mascotas')
      .delete()
      .eq('id', mascotaId)

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}
