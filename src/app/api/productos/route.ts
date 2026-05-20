import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, stock, activo, categoria, imagen_url')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error fetching productos:', error)
      return NextResponse.json(
        { error: error.message || 'Error al obtener productos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error en /api/productos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
