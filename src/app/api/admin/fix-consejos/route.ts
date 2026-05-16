import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('consejos')
      .select('id, titulo, activo, categoria')
      .in('categoria', ['Prevencion', 'Nutricion'])

    if (error) throw error

    if (!data || data.length === 0) {
      return Response.json({ success: true, message: 'No consejos encontrados' })
    }

    const updates = data.map(c => ({
      id: c.id,
      activo: true
    }))

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('consejos')
        .update({ activo: true })
        .eq('id', update.id)

      if (updateError) throw updateError
    }

    return Response.json({
      success: true,
      message: `${data.length} consejos actualizados a activo=true`,
      updated: data.map(c => ({ id: c.id, titulo: c.titulo, categoria: c.categoria }))
    })
  } catch (err: any) {
    console.error('Error:', err)
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
