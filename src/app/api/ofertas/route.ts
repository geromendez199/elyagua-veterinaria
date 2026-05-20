import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('ofertas')
      .select(`
        id,
        tipo,
        titulo,
        descripcion,
        descuento_porcentaje,
        precio_especial,
        fecha_inicio,
        fecha_fin,
        oferta_productos (
          producto_id,
          cantidad,
          productos:producto_id (
            id,
            nombre,
            precio,
            imagen_url,
            stock
          )
        )
      `)
      .eq('activo', true)
      .lte('fecha_inicio', now)
      .gte('fecha_fin', now)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ofertas:', error)
      return NextResponse.json(
        { error: 'Error al obtener ofertas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error en /api/ofertas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
