import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('millas_requeridas', { ascending: true })

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { millas_requeridas, descuento_porcentaje, activo } = await request.json()

    if (!millas_requeridas || !descuento_porcentaje) {
      return Response.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert([
        {
          millas_requeridas,
          descuento_porcentaje,
          activo: activo !== false,
        },
      ])
      .select()

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: data?.[0] })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, millas_requeridas, descuento_porcentaje, activo } = await request.json()

    if (!id) {
      return Response.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('milestones')
      .update({
        millas_requeridas,
        descuento_porcentaje,
        activo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: data?.[0] })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
