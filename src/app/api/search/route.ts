import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter } from '@/lib/rate-limit'

const rateLimiter = createRateLimiter(60000, 60)

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  const q = request.nextUrl.searchParams.get('q')?.trim() || ''

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, laboratorio')
      .eq('activo', true)
      .or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%,laboratorio.ilike.%${q}%`)
      .order('nombre', { ascending: true })
      .limit(8)

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
