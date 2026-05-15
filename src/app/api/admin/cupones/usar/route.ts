import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { cupon_id, pedido_id } = await request.json()

    if (!cupon_id || !pedido_id) {
      return Response.json(
        { success: false, error: 'cupon_id y pedido_id requeridos' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('cupones')
      .update({
        usado: true,
        usado_en_pedido: pedido_id,
        used_at: new Date().toISOString(),
      })
      .eq('id', cupon_id)

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
