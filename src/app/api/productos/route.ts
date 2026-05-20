import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('API: Iniciando fetch de productos...')
    console.log('URL disponible:', !!url)
    console.log('Key disponible:', !!key)

    if (!url || !key) {
      console.error('Variables de entorno faltantes')
      return NextResponse.json(
        { error: 'Configuración incompleta' },
        { status: 500 }
      )
    }

    const supabase = createClient(url, key)

    console.log('API: Cliente Supabase creado, ejecutando query...')

    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, stock, activo, categoria, imagen_url')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    console.log('API: Query completada')
    console.log('Data:', data?.length || 0, 'registros')
    console.log('Error:', error)

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
